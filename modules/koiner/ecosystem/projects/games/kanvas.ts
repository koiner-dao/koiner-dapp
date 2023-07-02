import { Project } from '@koiner/ecosystem';

export const kanvas: Project = {
  name: 'Kanvas',
  types: ['Game'],
  caption: 'Address/key generator',
  image: '/projects/game/kanvas.png',
  description:
    'The first collaborative and decentralized canvas, based on the first fee-less smart-contract blockchain.',
  token: {
    name: 'KAN',
    contractId: '1LeWGhDVD8g5rGCL4aDegEf9fKyTL1KhsS',
  },
  links: [
    {
      url: 'https://kanvas-app.com/',
      icon: 'fa-solid fa-globe',
    },
    {
      url: 'https://t.me/KanvasOfficial',
      icon: 'fa-brands fa-telegram',
    },
    {
      url: 'https://twitter.com/KanvasOfficial',
      icon: 'fa-brands fa-twitter',
    },
    {
      url: 'https://gitlab.com/engrave/koinos/koinos-paper-wallet',
      icon: 'fa-brands fa-github',
    },
  ],
  maintainers: [],
  tags: ['Game'],
};