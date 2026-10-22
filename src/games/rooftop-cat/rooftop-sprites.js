const _ = '';
const W = '#e8e8e8';
const G = '#888888';
const K = '#222222';
const P = '#ffaaaa';
const Y = '#ffee00';

export const MOCHI_IDLE = [
  [_,_,K,K,K,K,_,_,_,_,_,_,_,_,_,_],
  [_,K,W,W,W,W,K,_,_,_,_,_,_,_,_,_],
  [K,W,P,W,W,P,W,K,_,_,_,_,_,_,_,_],
  [K,W,K,W,W,K,W,K,_,_,_,_,_,_,_,_],
  [K,W,W,W,W,W,W,K,_,_,_,_,_,_,_,_],
  [K,G,W,W,W,W,G,K,_,_,_,_,_,_,_,_],
  [_,K,W,W,W,W,K,_,_,_,_,_,_,_,_,_],
  [_,K,G,K,_,K,G,K,_,_,_,_,_,K,K,_],
  [_,_,K,_,_,_,K,_,_,_,_,_,K,G,G,K],
  [_,_,K,_,_,_,K,_,_,_,_,K,G,G,G,K],
  [_,K,K,_,_,K,K,K,_,_,_,K,G,K,_,_],
];

export const PIGEON = [
  [_,_,K,K,K,_,_,_,_,_,_,_],
  [_,K,G,G,G,K,_,_,_,_,_,_],
  [K,G,W,G,G,G,K,_,_,_,_,_],
  [K,G,G,G,G,G,K,K,_,_,_,_],
  [_,K,G,G,G,K,G,G,K,_,_,_],
  [_,_,K,K,K,_,K,K,_,_,_,_],
  [_,_,K,_,K,_,_,_,_,_,_,_],
  [_,K,K,_,K,K,_,_,_,_,_,_],
];

export const FISH = [
  [_,_,Y,Y,Y,_,_,_],
  [_,Y,Y,Y,Y,Y,_,_],
  [Y,Y,Y,Y,Y,Y,Y,Y],
  [_,Y,Y,Y,Y,Y,_,_],
  [_,_,Y,Y,Y,_,_,_],
];

export const TILE_COLORS = {
  roof:  '#445566',
  brick: '#664433',
  sky:   '#112233',
  ac:    '#334455',
  air:   '#88ccff',
};
