import fzeroProf from '#lib/assets/characters/placeholder.webp';
import mzeroProf from '#lib/assets/characters/placeholder.webp';
import adlerProf from '#lib/assets/characters/adler.webp';
import daffProf from '#lib/assets/characters/daff.webp';
import edgarProf from '#lib/assets/characters/edgar.webp';
import hotoriProf from '#lib/assets/characters/hotori.webp';
import nanallyProf from '#lib/assets/characters/nanally.webp';
import sakiriProf from '#lib/assets/characters/sakiri.webp';
import hanielProf from '#lib/assets/characters/haniel.webp';
import hathorProf from '#lib/assets/characters/hathor.webp';
import jiuyuanProf from '#lib/assets/characters/jiuyuan.webp';
import iroiProf from '#lib/assets/characters/iroi.webp';
import mintProf from '#lib/assets/characters/mint.webp';
import shinkuProf from '#lib/assets/characters/shinku.webp';
import baicangProf from '#lib/assets/characters/baicang.webp';
import fadiaProf from '#lib/assets/characters/fadia.webp';
import lacriProf from '#lib/assets/characters/lacri.webp';
import skiaProf from '#lib/assets/characters/skia.webp';
import chaosProf from '#lib/assets/characters/chaos.webp';
import elymsProf from '#lib/assets/characters/elyms.webp';
import exeProf from '#lib/assets/characters/exe.webp';
import linkoProf from '#lib/assets/characters/linko.webp';
import nitsaProf from '#lib/assets/characters/placeholder.webp';
import chizProf from '#lib/assets/characters/chiz.webp';
import klingsnaProf from '#lib/assets/characters/placeholder.webp';
import sinclairProf from '#lib/assets/characters/placeholder.webp';
import akaneProf from '#lib/assets/characters/akane.webp';
import aureliaProf from '#lib/assets/characters/aurelia.webp';
import blackbirdProf from '#lib/assets/characters/blackbird.webp';
import zankouProf from '#lib/assets/characters/zankou.webp';
import ellieProf from '#lib/assets/characters/placeholder.webp';

export type Character = {
  id: string,
  name: string,
  image: string
}

export const characters: Character[] = [
  // Eibon
  {
    id: 'fzero',
    name: 'Zero (Female)',
    image: fzeroProf
  },
  {
    id: 'mzero',
    name: 'Zero (Male)',
    image: mzeroProf
  },
  {
    id: 'adler',
    name: 'Adler',
    image: adlerProf
  },
  {
    id: 'daffodill',
    name: 'Daffodill',
    image: daffProf
  },
  {
    id: 'edgar',
    name: 'Edgar',
    image: edgarProf
  },
  {
    id: 'hotori',
    name: 'Hotori',
    image: hotoriProf
  },
  {
    id: 'nanally',
    name: 'Nanally',
    image: nanallyProf
  },
  {
    id: 'sakiri',
    name: 'Sakiri',
    image: sakiriProf
  },
  // Terry Sexpress
  {
    id: 'haniel',
    name: 'Haniel',
    image: hanielProf
  },
  {
    id: 'hathor',
    name: 'Hathor',
    image: hathorProf
  },
  {
    id: 'jiuyuan',
    name: 'Jiuyuan',
    image: jiuyuanProf
  },
  // CSU-2
  {
    id: 'iroi',
    name: 'Iroi',
    image: iroiProf
  },
  {
    id: 'mint',
    name: 'Mint',
    image: mintProf
  },
  {
    id: 'shinku',
    name: 'Shinku',
    image: shinkuProf
  },
  // ETD-4
  {
    id: 'baicang',
    name: 'Baicang',
    image: baicangProf
  },
  {
    id: 'fadia',
    name: 'Fadia',
    image: fadiaProf
  },
  {
    id: 'requiem',
    name: 'Lacrimosa',
    image: lacriProf
  },
  {
    id: 'skia',
    name: 'Skia',
    image: skiaProf
  },
  // ETD-6
  {
    id: 'chaos',
    name: 'Chaos',
    image: chaosProf
  },
  {
    id: 'elyms',
    name: 'Elyms',
    image: elymsProf
  },
  {
    id: 'exe',
    name: 'Exe',
    image: exeProf
  },
  {
    id: 'linko',
    name: 'Linko',
    image: linkoProf
  },
  {
    id: 'nitsa',
    name: 'Nitsa',
    image: nitsaProf
  },
  // Dvorak
  {
    id: 'chiz',
    name: 'Chiz',
    image: chizProf
  },
  {
    id: 'klingsna',
    name: 'Klingsna',
    image: klingsnaProf
  },
  {
    id: 'sinclair',
    name: 'Sinclair',
    image: sinclairProf
  },
  // StarSign
  {
    id: 'akane',
    name: 'Akane',
    image: akaneProf
  },
  // Tamamochi
  {
    id: 'aurelia',
    name: 'Aurelia',
    image: aureliaProf
  },
  // Yggash Court
  {
    id: 'blackbird',
    name: 'Blackbird',
    image: blackbirdProf
  },
  // Your mind
  {
    id: 'zankou',
    name: 'Zankou',
    image: zankouProf
  },
  {
    id: 'ellie',
    name: 'Ellie',
    image: ellieProf
  },
]
