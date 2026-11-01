UPDATE public.user_usage
SET actions_purchased = COALESCE(actions_purchased, 0) + 100,
    updated_at = now()
WHERE user_id = 'fd662c75-6e1d-44f8-88ff-53b4429a137e';