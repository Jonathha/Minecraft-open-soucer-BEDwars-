import { TeamUpgrade } from '../../types/game';

export const TEAM_UPGRADES: TeamUpgrade[] = [
  {
    id: 'sharpness',
    name: 'Espadas Afiadas',
    costType: 'diamond',
    costAmount: 4,
    level: 0,
    maxLevel: 1,
    description: '+1 de Dano em todas as espadas da equipe'
  },
  {
    id: 'protection',
    name: 'Armadura Reforçada',
    costType: 'diamond',
    costAmount: 4,
    level: 0,
    maxLevel: 2,
    description: 'Reduz dano recebido em 15%'
  },
  {
    id: 'forge',
    name: 'Forja Rápida',
    costType: 'diamond',
    costAmount: 2,
    level: 0,
    maxLevel: 2,
    description: '+50% na velocidade dos geradores de ilha'
  },
  {
    id: 'heal_pool',
    name: 'Poço de Cura',
    costType: 'diamond',
    costAmount: 1,
    level: 0,
    maxLevel: 1,
    description: 'Regenera vida continuamente na sua ilha'
  }
];
