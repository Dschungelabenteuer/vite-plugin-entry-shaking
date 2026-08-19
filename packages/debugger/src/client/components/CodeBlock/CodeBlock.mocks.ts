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
