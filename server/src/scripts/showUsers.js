import { supabase } from "../db/supabaseClient.js";

async function showUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Users:', data);
  } else {
    console.log('No users found.');
  }
}

showUsers()
  .then(() => console.log('Finished fetching users.'))
  .catch(err => console.error('Error in fetching users:', err));
