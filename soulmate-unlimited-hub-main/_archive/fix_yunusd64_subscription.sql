-- yunusd64@gmail.com kullanıcısının subscription durumunu düzeltme
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. Kullanıcıyı bulun
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Kullanıcı ID'sini bul
    SELECT id INTO v_user_id 
    FROM profiles 
    WHERE email = 'yunusd64@gmail.com'
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Kullanıcı bulunamadı: yunusd64@gmail.com';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Kullanıcı bulundu. ID: %', v_user_id;
    
    -- 2. Profiles tablosunu güncelle - Gold tier ver
    UPDATE profiles
    SET 
        role = 'gold',
        subscription_tier = 'gold',
        subscription_status = 'active',
        subscription_expires_at = NOW() + INTERVAL '30 days',
        updated_at = NOW()
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Profiles tablosu güncellendi';
    
    -- 3. Subscribers tablosunda kayıt var mı kontrol et
    IF EXISTS (SELECT 1 FROM subscribers WHERE user_id = v_user_id) THEN
        -- Varsa güncelle
        UPDATE subscribers
        SET 
            subscribed = true,
            subscription_tier = 'gold',
            subscription_end = NOW() + INTERVAL '30 days',
            updated_at = NOW()
        WHERE user_id = v_user_id;
        
        RAISE NOTICE 'Subscribers tablosu güncellendi';
    ELSE
        -- Yoksa ekle
        INSERT INTO subscribers (
            user_id,
            email,
            subscribed,
            subscription_tier,
            subscription_end,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            'yunusd64@gmail.com',
            true,
            'gold',
            NOW() + INTERVAL '30 days',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Subscribers tablosuna yeni kayıt eklendi';
    END IF;
    
    -- 4. Güncel durumu göster
    RAISE NOTICE '--- GÜNCEL DURUM ---';
    
    -- Profile bilgisi
    PERFORM 1 FROM profiles 
    WHERE id = v_user_id 
    AND role = 'gold' 
    AND subscription_status = 'active';
    
    IF FOUND THEN
        RAISE NOTICE 'Profile: Gold tier, Active status ✓';
    ELSE
        RAISE NOTICE 'Profile: HATA - Güncelleme başarısız!';
    END IF;
    
    -- Subscriber bilgisi
    PERFORM 1 FROM subscribers 
    WHERE user_id = v_user_id 
    AND subscribed = true 
    AND subscription_tier = 'gold';
    
    IF FOUND THEN
        RAISE NOTICE 'Subscriber: Gold tier, Subscribed ✓';
    ELSE
        RAISE NOTICE 'Subscriber: HATA - Güncelleme başarısız!';
    END IF;
    
END $$;

-- Sonucu kontrol etmek için
SELECT 
    p.email,
    p.role as profile_role,
    p.subscription_tier as profile_tier,
    p.subscription_status as profile_status,
    p.subscription_expires_at as profile_expires,
    s.subscribed as subscriber_active,
    s.subscription_tier as subscriber_tier,
    s.subscription_end as subscriber_end
FROM profiles p
LEFT JOIN subscribers s ON p.id = s.user_id
WHERE p.email = 'yunusd64@gmail.com';