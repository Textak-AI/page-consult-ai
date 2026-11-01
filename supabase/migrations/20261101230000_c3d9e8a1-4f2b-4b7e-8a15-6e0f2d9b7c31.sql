-- Owner test allowance: 100 pack actions for the founder's own account so E2E
-- testing of charged flows can continue. Pack actions are the persistent balance
-- spent after rollover and the monthly allowance (see track_ai_action /
-- charge_page_build). Plan tier is unchanged, so the account still behaves as
-- Starter (badge, limits) everywhere else.
-- No schema or RLS changes.
UPDATE public.user_usage
SET actions_purchased = COALESCE(actions_purchased, 0) + 100,
    updated_at = now()
WHERE user_id = 'fd662c75-6e1d-44f8-88ff-53b4429a137e';
