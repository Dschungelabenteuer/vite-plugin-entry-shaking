export const SimpleSource = `use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ParserResult {
    pub nodes: Vec<Node>,
    pub diagnostics: Vec<Diagnostic>,
    pub map_path: HashMap<String, usize>,
    pub map_groups: HashMap<String, usize>,
    pub map_tokens: HashMap<String, usize>,
    pub map_types: HashMap<String, MapTypes>,
}

fn prepare_output(ctx: Context) -> ParserResult {
  return ParserResult {
      nodes: ctx.nodes,
      diagnostics: ctx.diagnostics,
      map_path: ctx.map_path,
      map_groups: ctx.map_groups,
      map_tokens: ctx.map_tokens,
      map_types: ctx.map_types,
  };
}`;

export const TsSource = `interface Song {
  name: string;
  artist: string;
  url: string;
}

const song: Song = {
  name: "Rien d'spécial",
  artist: "Nepal",
  url: "https://www.youtube.com/watch?v=NwIxIAztiag",
}

console.log(song.artist)`;

export const SourceDiffFrom = `import Timeflies from 'timeflies';
import { ref, Item } from 'vue';
import { baz, foo, fer } from 'somewhere';
import { res, val } from 'luv';
import Prout from 'prout';

const a = 1;

`;

export const SourceDiffTo = `import Timeflies from 'timeflies';
import { Item } from 'vue';
import { baz, bar, fer } from 'somewhere';
import { res, val } from 'luv';
import Prout from 'prout';

/** Determines whether this is odd. */
const odd = true;

const new1 = 1;
const new2 = 2;
`;
