#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kvrlzpdyeezmhjiiwfnp.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test photo mappings
const testPhotos = {
  // Female profiles
  'anna': ['/media/images/anna_1.jpg', '/media/images/anna_2.jpg', '/media/images/anna_3.jpg'],
  'emma': ['/media/images/emma_1.jpg', '/media/images/emma_2.jpg', '/media/images/emma_3.jpg'],
  'isabella': ['/media/images/isabella_1.jpg', '/media/images/isabella_2.jpg', '/media/images/isabella_3.jpg'],
  'lina': ['/media/images/lina_1.jpg', '/media/images/lina_2.jpg', '/media/images/lina_3.jpg'],
  'maja': ['/media/images/maja_1.jpg', '/media/images/maja_2.jpg', '/media/images/maja_3.jpg'],
  'sara': ['/media/images/sara_1.jpg', '/media/images/sara_2.jpg', '/media/images/sara_3.jpg'],
  
  // Male profiles
  'efe': ['/media/images/efe_1.jpg', '/media/images/efe_2.jpg', '/media/images/efe_3.jpg'],
  'erik': ['/media/images/erik_1.jpg', '/media/images/erik_2.jpg', '/media/images/erik_3.jpg'],
  'johan': ['/media/images/johan_1.jpg', '/media/images/johan_2.jpg', '/media/images/johan_3.jpg'],
  'oscar': ['/media/images/oscar_1.jpg', '/media/images/oscar_2.jpg', '/media/images/oscar_3.jpg']
};

async function populateTestPhotos() {
  try {
    // Get all profiles
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, name, gender')
      .not('name', 'is', null);
    
    if (fetchError) {
      return;
    }
    
    for (const profile of profiles) {
      if (!profile.name) continue;
      
      const firstName = profile.name.toLowerCase().split(' ')[0];
      const photos = testPhotos[firstName];
      
      if (photos) {
        await supabase
          .from('profiles')
          .update({ 
            photos: photos,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);
      } else {
        // Use default photos based on gender
        const defaultPhotos = profile.gender === 'male' 
          ? ['/media/images/default_male.jpg']
          : ['/media/images/default_female.jpg'];
        
        await supabase
          .from('profiles')
          .update({ 
            photos: defaultPhotos,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);
      }
    }
    
  } catch (error) {
    // Error handling
  }
}

// Run the script
populateTestPhotos();