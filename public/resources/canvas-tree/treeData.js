export const treeData = [
  {
    name: '权限A',
    isPlatform: true,
    children: [
      {
        name: '权限a',
        isShop: true,
      },
    ],
  },
  {
    name: '权限B',
    isPlatform: true,
    isOperator: true,
    children: [
      {
        name: '权限b',
        isShop: true,
        children: [
          {
            name: 'b子权限',
            isOperator: true,
          },
        ],
      },
    ],
  },
  {
    name: '权限C',
    isPlatform: true,
    isOperator: true,
    children: [
      {
        name: '权限c1',
        isShop: true,
      },
      {
        name: '权限c2',
        isPlatform: true,
      },
    ],
  },
  {
    name: '权限D',
    isOperator: true,
    children: [
      {
        name: '权限d1',
        isShop: true,
        children: [
          {
            name: 'd子权限',
            isPlatform: true,
          },
        ],
      },
      {
        name: '权限d2',
        isPlatform: true,
      },
    ],
  },
];
