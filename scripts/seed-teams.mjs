import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://yrgpkcnndsjlxuirrndh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZ3BrY25uZHNqbHh1aXJybmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjEzMDIsImV4cCI6MjA5MTg5NzMwMn0.lNgyShqXzgqeydVzGgSBi5EfkB0wM4oB6s5ryLrja00';
const supabase = createClient(supabaseUrl, supabaseKey);

// Read file
const content = readFileSync('equipos_2026.txt', 'utf8');
const lines = content.trim().split('\n');

console.log('Lines:', lines.length);

// Get tournament
const { data: tournaments } = await supabase.from('tournament').select('*').order('year', { ascending: false });
console.log('Tournaments:', tournaments?.map(t => t.name));

// Find 2026
let tournament = tournaments?.find(t => t.year === 2026);
console.log('Tournament 2026:', tournament);

if (!tournament) {
  console.log('No tournament 2026 found, creating...');
  const { data: newTournament, error } = await supabase.from('tournament').insert({ name: 'Torneo 2026', year: 2026, active: true }).select().single();
  if (error) {
    console.error('Error creating tournament:', error);
    process.exit(1);
  }
  tournament = newTournament;
  console.log('Created tournament:', tournament);
}

// Now process teams
for (const line of lines) {
  const parts = line.split(',').map(p => p.trim());
  const teamName = parts[0];
  const players = parts.slice(1);

  console.log(`\nTeam: ${teamName} (${players.length} players)`);

  // Create team
  const { data: team, error: teamError } = await supabase.from('team').insert({
    tournament_id: tournament.id,
    name: teamName,
    active: true
  }).select().single();

  if (teamError) {
    console.error(`Error creating team ${teamName}:`, teamError);
    continue;
  }

  console.log(`Created team: ${team.name} (id: ${team.id})`);

  // Create players
  for (const playerName of players) {
    // Parse first name and last name - assume last word is last name
    const nameParts = playerName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    const { error: playerError } = await supabase.from('player').insert({
      team_id: team.id,
      first_name: firstName,
      last_name: lastName,
      active: true
    });

    if (playerError) {
      console.error(`Error creating player ${playerName}:`, playerError);
    }
  }

  console.log(`Created ${players.length} players for ${teamName}`);
}

console.log('\n✅ Seed complete!');