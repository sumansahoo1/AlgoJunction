import { supabase } from "../db/supabaseClient.js";

const fakeUsers = [
  { username: 'john_doe' },
  { username: 'jane_smith' },
  { username: 'bob_johnson' },
  { username: 'alice_williams' },
  { username: 'charlie_brown' }
];

async function populateUsers() {
  for (const user of fakeUsers) {
    const { data, error } = await supabase
      .from('users')
      .insert([user]);
    
    if (error) {
      console.error(`Error inserting user ${user.username}:`, error);
    } else {
      console.log(`Successfully inserted user ${user.username}`);
    }
  }
}

populateUsers()
  .then(() => console.log('Finished populating users table'))
  .catch(err => console.error('Error in populating users:', err));