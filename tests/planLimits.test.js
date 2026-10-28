import { describe, it, expect } from 'vitest';
import { PLAN_ALLOWANCES, FREE_ALLOWANCE, ACTION_COSTS, ACTION_PACKS } from '../supabase/functions/_shared/planLimits.ts';

describe('plan allowances (single source of truth)', () => {
  it('starter/free get 30 actions', () => { expect(PLAN_ALLOWANCES.starter.actionsLimit).toBe(30); expect(FREE_ALLOWANCE.actionsLimit).toBe(30); });
  it('pro gets 150 actions', () => expect(PLAN_ALLOWANCES.pro.actionsLimit).toBe(150));
  it('founding and agency are effectively unlimited', () => { expect(PLAN_ALLOWANCES.founding.actionsLimit).toBe(999999); expect(PLAN_ALLOWANCES.agency.tier).toBe('agency'); });
  it('page regeneration costs 3, section regeneration costs 1', () => { expect(ACTION_COSTS.page_generation).toBe(3); expect(ACTION_COSTS.section_regeneration).toBe(1); });
  it('action packs are 10/25/50', () => expect(Object.values(ACTION_PACKS).sort((a,b)=>a-b)).toEqual([10,25,50]));
});
