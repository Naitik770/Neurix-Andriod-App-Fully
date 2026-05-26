/**
 * Standardized score targets for game leveling.
 * Determines the target points required to complete each level for each game type.
 */
export function getTargetScore(gameType: string, level: number): number {
  switch (gameType) {
    case 'Color Match':
      return 150 + level * 25;
    case 'Memory Matrix':
      return 100 + level * 15;
    case 'Speed Match':
      return 150 + level * 25;
    case 'Math Rush':
      return 100 + level * 15;
    case 'Word Scramble':
      return 100 + level * 15;
    case 'Pattern Recognition':
      return 80 + level * 15;
    case 'Spatial Reasoning':
      return 80 + level * 15;
    case 'Reaction Time':
      return 300 + level * 40;
    case 'Logic Flow':
      return 70 + level * 15;
    case 'Cognitive Load':
    case 'Cognitive Load Challenge':
      return 120 + level * 20;
    default:
      return 100 + level * 15;
  }
}
