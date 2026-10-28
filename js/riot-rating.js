/**
 * riot-rating.js — Riot Games Esports Matchmaking Rating (MMR) & Tier Engine
 * 
 * Implements:
 *   1. Elo Rating System with Dynamic K-Factor & Performance Multipliers
 *   2. Glicko-2 System with Rating Deviation (RD) and Volatility (sigma)
 *   3. Ranked Tier System: Iron -> Bronze -> Silver -> Gold -> Platinum -> Emerald -> Diamond -> Master -> GM -> Challenger
 *   4. LP (League Points 0-100) Progression, Promotion Matches & Demotion Protection
 *   5. Match outcome simulator & Ranked Season Simulator
 * 
 * API:
 *   window.RiotRatingEngine = {
 *     calculateElo(playerElo, opponentElo, score, kFactor),
 *     calculateGlicko2(rating, rd, vol, matches),
 *     calculateMatchOutcome(playerState, matchDetails),
 *     getTierInfo(mmr),
 *     simulateRankedSeason(initialMmr, numMatches)
 *   }
 */

(function (global) {
  'use strict';

  // Constants & System Parameters
  const GLICKO_SCALE = 173.7178;
  const DEFAULT_VOLATILITY = 0.06;
  const SYSTEM_TAU = 0.5; // Volatility change constraint

  // Tier MMR Thresholds & Details
  const TIERS = [
    { name: 'Iron',        color: '#51484F', minMmr: 0,    maxMmr: 799,  divisions: 4 },
    { name: 'Bronze',      color: '#8C513A', minMmr: 800,  maxMmr: 1149, divisions: 4 },
    { name: 'Silver',      color: '#80989D', minMmr: 1150, maxMmr: 1499, divisions: 4 },
    { name: 'Gold',        color: '#CD8837', minMmr: 1500, maxMmr: 1849, divisions: 4 },
    { name: 'Platinum',    color: '#4E9996', minMmr: 1850, maxMmr: 2199, divisions: 4 },
    { name: 'Emerald',     color: '#28965A', minMmr: 2200, maxMmr: 2499, divisions: 4 },
    { name: 'Diamond',     color: '#576BCE', minMmr: 2500, maxMmr: 2899, divisions: 4 },
    { name: 'Master',      color: '#9D48E0', minMmr: 2900, maxMmr: 3299, divisions: 1 },
    { name: 'Grandmaster', color: '#E04848', minMmr: 3300, maxMmr: 3699, divisions: 1 },
    { name: 'Challenger',  color: '#F4C430', minMmr: 3700, maxMmr: 5000, divisions: 1 }
  ];

  class RiotRatingEngine {
    constructor() {
      this.tiers = TIERS;
    }

    /**
     * Standard Elo Rating Calculation
     * @param {number} playerElo
     * @param {number} opponentElo
     * @param {number} outcome 1.0 = Win, 0.5 = Draw, 0.0 = Loss
     * @param {number} kFactor Base sensitivity (default 32)
     * @returns {{newElo: number, delta: number, expectedScore: number}}
     */
    calculateElo(playerElo, opponentElo, outcome, kFactor = 32) {
      const expectedScore = 1.0 / (1.0 + Math.pow(10, (opponentElo - playerElo) / 400));
      const delta = Math.round(kFactor * (outcome - expectedScore));
      return {
        newElo: Math.max(100, Math.round(playerElo + delta)),
        delta,
        expectedScore: parseFloat(expectedScore.toFixed(4))
      };
    }

    /**
     * Resolves ranked tier and division based on MMR
     * @param {number} mmr
     * @returns {{tier: string, division: string, lp: number, badgeColor: string, isApex: boolean}}
     */
    getTierInfo(mmr) {
      const cleanMmr = Math.max(0, Math.min(5000, mmr));
      let currentTier = TIERS[0];

      for (let i = 0; i < TIERS.length; i++) {
        if (cleanMmr >= TIERS[i].minMmr && cleanMmr <= TIERS[i].maxMmr) {
          currentTier = TIERS[i];
          break;
        }
      }

      if (cleanMmr >= 3700) currentTier = TIERS[TIERS.length - 1];

      const isApex = currentTier.divisions === 1;
      let division = 'I';
      let lp = 0;

      if (!isApex) {
        const tierSpan = currentTier.maxMmr - currentTier.minMmr + 1;
        const divSpan = tierSpan / currentTier.divisions;
        const offset = cleanMmr - currentTier.minMmr;
        const divIndex = Math.min(3, Math.floor(offset / divSpan));
        const divNames = ['IV', 'III', 'II', 'I'];
        division = divNames[divIndex];
        lp = Math.min(100, Math.floor(((offset % divSpan) / divSpan) * 100));
      } else {
        // In Master+ LP is unbounded
        lp = cleanMmr - currentTier.minMmr;
      }

      return {
        tier: currentTier.name,
        division: isApex ? '' : division,
        lp: Math.max(0, lp),
        badgeColor: currentTier.color,
        isApex,
        formatted: isApex ? `${currentTier.name} ${lp} LP` : `${currentTier.name} ${division} - ${lp} LP`
      };
    }

    /**
     * Glicko-2 Mathematical Implementation
     * Converts to Glicko-2 scale: mu = (r - 1500) / 173.7178, phi = rd / 173.7178
     * @param {number} r Player rating
     * @param {number} rd Rating deviation
     * @param {number} vol Volatility
     * @param {Array<{r: number, rd: number, outcome: number}>} matches
     * @returns {{rating: number, rd: number, vol: number}}
     */
    calculateGlicko2(r, rd, vol = DEFAULT_VOLATILITY, matches = []) {
      const mu = (r - 1500) / GLICKO_SCALE;
      const phi = rd / GLICKO_SCALE;

      if (!matches || matches.length === 0) {
        // Rating decay over time period
        const newPhi = Math.sqrt(phi * phi + vol * vol);
        return {
          rating: r,
          rd: Math.min(350, Math.round(newPhi * GLICKO_SCALE)),
          vol
        };
      }

      const g = (p) => 1.0 / Math.sqrt(1.0 + (3.0 * p * p) / (Math.PI * Math.PI));
      const E = (m, oppM, oppP) => 1.0 / (1.0 + Math.exp(-g(oppP) * (m - oppM)));

      // Step 3: Compute estimated variance v
      let vInv = 0.0;
      let deltaSum = 0.0;

      matches.forEach(m => {
        const oppMu = (m.r - 1500) / GLICKO_SCALE;
        const oppPhi = m.rd / GLICKO_SCALE;
        const gPhi = g(oppPhi);
        const expScore = E(mu, oppMu, oppPhi);

        vInv += gPhi * gPhi * expScore * (1.0 - expScore);
        deltaSum += gPhi * (m.outcome - expScore);
      });

      const v = 1.0 / vInv;
      const delta = v * deltaSum;

      // Step 5: Determine new volatility using Illinois-style numeric approximation
      const a = Math.log(vol * vol);
      const f = (x) => {
        const ex = Math.exp(x);
        const d2 = delta * delta;
        const p2 = phi * phi;
        const term1 = (ex * (d2 - p2 - v - ex)) / (2.0 * Math.pow(p2 + v + ex, 2));
        const term2 = (x - a) / (SYSTEM_TAU * SYSTEM_TAU);
        return term1 - term2;
      };

      let A = a;
      let B = delta * delta > phi * phi + v ? Math.log(delta * delta - phi * phi - v) : a - 2.0 * SYSTEM_TAU;
      let fA = f(A);
      let fB = f(B);

      for (let iter = 0; iter < 25 && Math.abs(B - A) > 1e-6; iter++) {
        const C = A + (A - B) * fA / (fB - fA);
        const fC = f(C);
        if (fC * fB < 0) {
          A = B;
          fA = fB;
        } else {
          fA /= 2.0;
        }
        B = C;
        fB = fC;
      }

      const newVol = Math.exp(B / 2.0);

      // Step 6: Update rating deviation and rating
      const phiStar = Math.sqrt(phi * phi + newVol * newVol);
      const newPhi = 1.0 / Math.sqrt(1.0 / (phiStar * phiStar) + 1.0 / v);
      const newMu = mu + newPhi * newPhi * deltaSum;

      return {
        rating: Math.round(newMu * GLICKO_SCALE + 1500),
        rd: Math.min(350, Math.round(newPhi * GLICKO_SCALE)),
        vol: parseFloat(newVol.toFixed(6))
      };
    }

    /**
     * Evaluates a full Riot ranked match with KDA multiplier & LP calculation
     * @param {Object} player Current player stats
     * @param {Object} match Match outcome details
     */
    calculateMatchOutcome(player, match) {
      const currentMmr = player.mmr || 1500;
      const currentLp = player.lp !== undefined ? player.lp : 50;
      const opponentMmr = match.opponentTeamAverageMmr || currentMmr;
      const isWin = match.outcome === 'win' || match.outcome === 1.0;
      const kda = match.kda || 2.0;
      const streak = match.winStreak || 0;

      // Base LP Gain/Loss based on MMR delta
      const mmrDelta = currentMmr - opponentMmr;
      let baseLp = isWin ? 20 : -18;

      if (isWin) {
        if (mmrDelta < -100) baseLp += 5; // Underdog bonus
        if (kda >= 4.0) baseLp += 3;      // High performance bonus
        if (streak >= 3) baseLp += Math.min(5, streak - 2); // Win streak bonus
      } else {
        if (mmrDelta > 100) baseLp -= 4;  // Overdog upset penalty
        if (kda >= 3.5) baseLp += 2;      // ACE performance mitigation
      }

      const eloRes = this.calculateElo(currentMmr, opponentMmr, isWin ? 1.0 : 0.0);
      const nextMmr = eloRes.newElo;

      // Handle Tier Promotion & Demotion logic
      let nextLp = currentLp + baseLp;
      let promotionEvent = null;

      if (nextLp >= 100) {
        promotionEvent = 'PROMOTION_QUALIFIED';
        nextLp = 100;
      } else if (nextLp < 0) {
        if (currentLp === 0) {
          promotionEvent = 'DEMOTION_WARNING';
          nextLp = 0;
        } else {
          nextLp = 0;
        }
      }

      const newTier = this.getTierInfo(nextMmr);

      return {
        previousMmr: currentMmr,
        newMmr: nextMmr,
        mmrChange: eloRes.delta,
        lpChange: baseLp,
        newLp: nextLp,
        promotionEvent,
        tierInfo: newTier
      };
    }

    /**
     * Simulates a multi-match season
     */
    simulateRankedSeason(initialMmr = 1500, matchCount = 10) {
      let state = { mmr: initialMmr, lp: 50 };
      const history = [];

      for (let i = 1; i <= matchCount; i++) {
        const oppMmr = state.mmr + Math.round((Math.random() - 0.5) * 150);
        const winProb = 1.0 / (1.0 + Math.pow(10, (oppMmr - state.mmr) / 400));
        const isWin = Math.random() < winProb;
        const kda = isWin ? 2.5 + Math.random() * 3.5 : 1.0 + Math.random() * 2.0;

        const res = this.calculateMatchOutcome(state, {
          opponentTeamAverageMmr: oppMmr,
          outcome: isWin ? 'win' : 'loss',
          kda
        });

        state = { mmr: res.newMmr, lp: res.newLp };
        history.push({
          matchNumber: i,
          isWin,
          opponentMmr: oppMmr,
          newMmr: res.newMmr,
          lp: res.newLp,
          tier: res.tierInfo.formatted
        });
      }

      return {
        finalState: state,
        finalTier: this.getTierInfo(state.mmr),
        history
      };
    }
  }

  const engine = new RiotRatingEngine();

  if (typeof window !== 'undefined') {
    window.RiotRatingEngine = engine;
    window.RiotRatingClass = RiotRatingEngine;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RiotRatingEngine: engine, RiotRatingClass: RiotRatingEngine };
  }
})(typeof window !== 'undefined' ? window : global);
