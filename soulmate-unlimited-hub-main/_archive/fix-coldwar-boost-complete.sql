-- Complete fix for coldwar6464x@gmail.com Gold user boost issues
-- Bu script coldwar kullanıcısının Gold üyelik boost sorunlarını düzeltir

-- 1. Önce kullanıcının mevcut durumunu kontrol et
SELECT 
    p.id,
    p.email,
    p.username,
    p.role,
    p.subscription_tier,
    p.monthly_boosts_used,
    p.last_boost_reset,
    DATE_TRUNC('month', CURRENT_DATE) as current_month_start,
    CASE 
        WHEN p.last_boost_reset IS NULL OR p.last_boost_reset < DATE_TRUNC('month', CURRENT_DATE) 
        THEN 'Needs reset'
        ELSE 'Current'
    END as reset_status
FROM profiles p
WHERE p.email = 'coldwar6464x@gmail.com';

-- 2. Kullanıcıyı Gold olarak ayarla ve ay başındaysa boost sayacını sıfırla
UPDATE profiles
SET 
    subscription_tier = 'gold',
    role = 'gold',
    -- Eğer yeni ay ise boost sayacını sıfırla
    monthly_boosts_used = CASE 
        WHEN last_boost_reset IS NULL OR last_boost_reset < DATE_TRUNC('month', CURRENT_DATE)
        THEN 0
        ELSE monthly_boosts_used
    END,
    last_boost_reset = CASE 
        WHEN last_boost_reset IS NULL OR last_boost_reset < DATE_TRUNC('month', CURRENT_DATE)
        THEN CURRENT_TIMESTAMP
        ELSE last_boost_reset
    END
WHERE email = 'coldwar6464x@gmail.com';

-- 3. Bu ayki gerçek boost kullanımını say ve güncelle
WITH boost_count AS (
    SELECT 
        p.id,
        COUNT(pb.id) as actual_boosts_this_month
    FROM profiles p
    LEFT JOIN profile_boosts pb ON pb.user_id = p.id 
        AND pb.started_at >= DATE_TRUNC('month', CURRENT_DATE)
    WHERE p.email = 'coldwar6464x@gmail.com'
    GROUP BY p.id
)
UPDATE profiles p
SET 
    monthly_boosts_used = bc.actual_boosts_this_month
FROM boost_count bc
WHERE p.id = bc.id;

-- 4. User_roles tablosunda gold rolünü garantile
-- Önce mevcut rolleri temizle
DELETE FROM user_roles 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'coldwar6464x@gmail.com')
AND role NOT IN ('gold', 'registered');

-- Gold rolü yoksa ekle
INSERT INTO user_roles (user_id, role)
SELECT 
    p.id,
    'gold'
FROM profiles p
WHERE p.email = 'coldwar6464x@gmail.com'
AND NOT EXISTS (
    SELECT 1 
    FROM user_roles ur 
    WHERE ur.user_id = p.id 
    AND ur.role = 'gold'
);

-- 5. Subscribers tablosunu da güncelle (eğer varsa)
UPDATE subscribers
SET 
    subscribed = true,
    subscription_tier = 'gold',
    subscription_end = CURRENT_DATE + INTERVAL '30 days'
WHERE user_id = (SELECT id FROM profiles WHERE email = 'coldwar6464x@gmail.com');

-- Eğer subscribers tablosunda yoksa ekle
INSERT INTO subscribers (user_id, email, subscribed, subscription_tier, subscription_end)
SELECT 
    p.id,
    p.email,
    true,
    'gold',
    CURRENT_DATE + INTERVAL '30 days'
FROM profiles p
WHERE p.email = 'coldwar6464x@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM subscribers s WHERE s.user_id = p.id
);

-- 6. Son durum kontrolü - kullanıcının boost durumu
WITH user_boost_status AS (
    SELECT 
        p.id,
        p.email,
        p.username,
        p.subscription_tier,
        p.monthly_boosts_used,
        3 as gold_monthly_limit,
        COUNT(pb.id) as actual_boosts_this_month,
        MAX(pb.started_at) as last_boost_date
    FROM profiles p
    LEFT JOIN profile_boosts pb ON pb.user_id = p.id 
        AND pb.started_at >= DATE_TRUNC('month', CURRENT_DATE)
    WHERE p.email = 'coldwar6464x@gmail.com'
    GROUP BY p.id
)
SELECT 
    email,
    username,
    subscription_tier,
    gold_monthly_limit as "Monthly Boost Limit",
    actual_boosts_this_month as "Boosts Used This Month",
    gold_monthly_limit - actual_boosts_this_month as "Remaining Boosts",
    last_boost_date as "Last Boost Used",
    CASE 
        WHEN actual_boosts_this_month >= gold_monthly_limit THEN '❌ Monthly limit reached'
        ELSE '✅ Can use boost (' || (gold_monthly_limit - actual_boosts_this_month) || ' remaining)'
    END as "Boost Status"
FROM user_boost_status;

-- 7. Aktif boost var mı kontrol et
SELECT 
    pb.id,
    pb.boost_type,
    pb.started_at,
    pb.ends_at,
    pb.is_active,
    CASE 
        WHEN pb.ends_at > NOW() THEN 'Active for ' || 
            EXTRACT(MINUTE FROM pb.ends_at - NOW()) || ' minutes'
        ELSE 'Expired'
    END as status
FROM profile_boosts pb
JOIN profiles p ON p.id = pb.user_id
WHERE p.email = 'coldwar6464x@gmail.com'
AND pb.is_active = true
ORDER BY pb.started_at DESC
LIMIT 5;