import React from 'react';
// import { Icon, Popup, Grid, Search, Radio } from 'semantic-ui-react';
// import _ from 'lodash';
// import * as d3 from 'd3';
// import './NetworkGraph.scss';
// import networkDataNew from '../../services/networkDataNew.json';
import NetworkFrame from 'semiotic/lib/NetworkFrame';

const theme = [
  '#ac58e5',
  '#E0488B',
  '#9fd0cb',
  '#e0d33a',
  '#7566ff',
  '#533f82',
  '#7a255d',
  '#365350',
  '#a19a11',
  '#3f4482'
];
const frameProps = {
  nodes: [
    { name: 'Myriel', group: 1 },
    { name: 'Napoleon', group: 1 },
    { name: 'Mlle.Baptistine', group: 1 },
    { name: 'Mme.Magloire', group: 1 },
    { name: 'CountessdeLo', group: 1 },
    { name: 'Geborand', group: 1 },
    { name: 'Champtercier', group: 1 },
    { name: 'Cravatte', group: 1 },
    { name: 'Count', group: 1 },
    { name: 'OldMan', group: 1 },
    { name: 'Labarre', group: 2 },
    { name: 'Valjean', group: 2 },
    { name: 'Marguerite', group: 3 },
    { name: 'Mme.deR', group: 2 },
    { name: 'Isabeau', group: 2 },
    { name: 'Gervais', group: 2 },
    { name: 'Tholomyes', group: 3 },
    { name: 'Listolier', group: 3 },
    { name: 'Fameuil', group: 3 },
    { name: 'Blacheville', group: 3 },
    { name: 'Favourite', group: 3 },
    { name: 'Dahlia', group: 3 },
    { name: 'Zephine', group: 3 },
    { name: 'Fantine', group: 3 },
    { name: 'Mme.Thenardier', group: 4 },
    { name: 'Thenardier', group: 4 },
    { name: 'Cosette', group: 5 },
    { name: 'Javert', group: 4 },
    { name: 'Fauchelevent', group: 0 },
    { name: 'Bamatabois', group: 2 },
    { name: 'Perpetue', group: 3 },
    { name: 'Simplice', group: 2 },
    { name: 'Scaufflaire', group: 2 },
    { name: 'Woman1', group: 2 },
    { name: 'Judge', group: 2 },
    { name: 'Champmathieu', group: 2 },
    { name: 'Brevet', group: 2 },
    { name: 'Chenildieu', group: 2 },
    { name: 'Cochepaille', group: 2 },
    { name: 'Pontmercy', group: 4 },
    { name: 'Boulatruelle', group: 6 },
    { name: 'Eponine', group: 4 },
    { name: 'Anzelma', group: 4 },
    { name: 'Woman2', group: 5 },
    { name: 'MotherInnocent', group: 0 },
    { name: 'Gribier', group: 0 },
    { name: 'Jondrette', group: 7 },
    { name: 'Mme.Burgon', group: 7 },
    { name: 'Gavroche', group: 8 },
    { name: 'Gillenormand', group: 5 },
    { name: 'Magnon', group: 5 },
    { name: 'Mlle.Gillenormand', group: 5 },
    { name: 'Mme.Pontmercy', group: 5 },
    { name: 'Mlle.Vaubois', group: 5 },
    { name: 'Lt.Gillenormand', group: 5 },
    { name: 'Marius', group: 8 },
    { name: 'BaronessT', group: 5 },
    { name: 'Mabeuf', group: 8 },
    { name: 'Enjolras', group: 8 },
    { name: 'Combeferre', group: 8 },
    { name: 'Prouvaire', group: 8 },
    { name: 'Feuilly', group: 8 },
    { name: 'Courfeyrac', group: 8 },
    { name: 'Bahorel', group: 8 },
    { name: 'Bossuet', group: 8 },
    { name: 'Joly', group: 8 },
    { name: 'Grantaire', group: 8 },
    { name: 'MotherPlutarch', group: 9 },
    { name: 'Gueulemer', group: 4 },
    { name: 'Babet', group: 4 },
    { name: 'Claquesous', group: 4 },
    { name: 'Montparnasse', group: 4 },
    { name: 'Toussaint', group: 5 },
    { name: 'Child1', group: 10 },
    { name: 'Child2', group: 10 },
    { name: 'Brujon', group: 4 },
    { name: 'Mme.Hucheloup', group: 8 }
  ],
  edges: [
    {
      source: { name: 'Napoleon', group: 1 },
      target: { name: 'Myriel', group: 1 },
      value: 1
    },
    {
      source: { name: 'Mlle.Baptistine', group: 1 },
      target: { name: 'Myriel', group: 1 },
      value: 8
    },
    {
      source: { name: 'Mme.Magloire', group: 1 },
      target: { name: 'Myriel', group: 1 },
      value: 10
    },
    {
      source: { name: 'Mme.Magloire', group: 1 },
      target: { name: 'Mlle.Baptistine', group: 1 },
      value: 6
    },
    {
      source: { name: 'CountessdeLo', group: 1 },
      target: { name: 'Myriel', group: 1 },
      value: 1
    },
    {
      source: { name: 'Geborand', group: 1 },
      target: { name: 'Myriel', group: 1 },
      value: 1
    },
    {
      source: { name: 'Champtercier', group: 1 },
      target: { name: 'Myriel', group: 1 },
      value: 1
    },
    {
      source: { name: 'Cravatte', group: 1 },
      target: { name: 'Myriel', group: 1 },
      value: 1
    },
    {
      source: { name: 'Count', group: 1 },
      target: { name: 'Myriel', group: 1 },
      value: 2
    },
    {
      source: { name: 'OldMan', group: 1 },
      target: { name: 'Myriel', group: 1 },
      value: 1
    },
    {
      source: { name: 'Valjean', group: 2 },
      target: { name: 'Labarre', group: 2 },
      value: 1
    },
    {
      source: { name: 'Valjean', group: 2 },
      target: { name: 'Mme.Magloire', group: 1 },
      value: 3
    },
    {
      source: { name: 'Valjean', group: 2 },
      target: { name: 'Mlle.Baptistine', group: 1 },
      value: 3
    },
    {
      source: { name: 'Valjean', group: 2 },
      target: { name: 'Myriel', group: 1 },
      value: 5
    },
    {
      source: { name: 'Marguerite', group: 3 },
      target: { name: 'Valjean', group: 2 },
      value: 1
    },
    {
      source: { name: 'Mme.deR', group: 2 },
      target: { name: 'Valjean', group: 2 },
      value: 1
    },
    {
      source: { name: 'Isabeau', group: 2 },
      target: { name: 'Valjean', group: 2 },
      value: 1
    },
    {
      source: { name: 'Gervais', group: 2 },
      target: { name: 'Valjean', group: 2 },
      value: 1
    },
    {
      source: { name: 'Listolier', group: 3 },
      target: { name: 'Tholomyes', group: 3 },
      value: 4
    },
    {
      source: { name: 'Fameuil', group: 3 },
      target: { name: 'Tholomyes', group: 3 },
      value: 4
    },
    {
      source: { name: 'Fameuil', group: 3 },
      target: { name: 'Listolier', group: 3 },
      value: 4
    },
    {
      source: { name: 'Blacheville', group: 3 },
      target: { name: 'Tholomyes', group: 3 },
      value: 4
    },
    {
      source: { name: 'Blacheville', group: 3 },
      target: { name: 'Listolier', group: 3 },
      value: 4
    },
    {
      source: { name: 'Blacheville', group: 3 },
      target: { name: 'Fameuil', group: 3 },
      value: 4
    },
    {
      source: { name: 'Favourite', group: 3 },
      target: { name: 'Tholomyes', group: 3 },
      value: 3
    },
    {
      source: { name: 'Favourite', group: 3 },
      target: { name: 'Listolier', group: 3 },
      value: 3
    },
    {
      source: { name: 'Favourite', group: 3 },
      target: { name: 'Fameuil', group: 3 },
      value: 3
    },
    {
      source: { name: 'Favourite', group: 3 },
      target: { name: 'Blacheville', group: 3 },
      value: 4
    },
    {
      source: { name: 'Dahlia', group: 3 },
      target: { name: 'Tholomyes', group: 3 },
      value: 3
    },
    {
      source: { name: 'Dahlia', group: 3 },
      target: { name: 'Listolier', group: 3 },
      value: 3
    },
    {
      source: { name: 'Dahlia', group: 3 },
      target: { name: 'Fameuil', group: 3 },
      value: 3
    },
    {
      source: { name: 'Dahlia', group: 3 },
      target: { name: 'Blacheville', group: 3 },
      value: 3
    },
    {
      source: { name: 'Dahlia', group: 3 },
      target: { name: 'Favourite', group: 3 },
      value: 5
    },
    {
      source: { name: 'Zephine', group: 3 },
      target: { name: 'Tholomyes', group: 3 },
      value: 3
    },
    {
      source: { name: 'Zephine', group: 3 },
      target: { name: 'Listolier', group: 3 },
      value: 3
    },
    {
      source: { name: 'Zephine', group: 3 },
      target: { name: 'Fameuil', group: 3 },
      value: 3
    },
    {
      source: { name: 'Zephine', group: 3 },
      target: { name: 'Blacheville', group: 3 },
      value: 3
    },
    {
      source: { name: 'Zephine', group: 3 },
      target: { name: 'Favourite', group: 3 },
      value: 4
    },
    {
      source: { name: 'Zephine', group: 3 },
      target: { name: 'Dahlia', group: 3 },
      value: 4
    },
    {
      source: { name: 'Fantine', group: 3 },
      target: { name: 'Tholomyes', group: 3 },
      value: 3
    },
    {
      source: { name: 'Fantine', group: 3 },
      target: { name: 'Listolier', group: 3 },
      value: 3
    },
    {
      source: { name: 'Fantine', group: 3 },
      target: { name: 'Fameuil', group: 3 },
      value: 3
    },
    {
      source: { name: 'Fantine', group: 3 },
      target: { name: 'Blacheville', group: 3 },
      value: 3
    },
    {
      source: { name: 'Fantine', group: 3 },
      target: { name: 'Favourite', group: 3 },
      value: 4
    },
    {
      source: { name: 'Fantine', group: 3 },
      target: { name: 'Dahlia', group: 3 },
      value: 4
    },
    {
      source: { name: 'Fantine', group: 3 },
      target: { name: 'Zephine', group: 3 },
      value: 4
    },
    {
      source: { name: 'Fantine', group: 3 },
      target: { name: 'Marguerite', group: 3 },
      value: 2
    },
    {
      source: { name: 'Fantine', group: 3 },
      target: { name: 'Valjean', group: 2 },
      value: 9
    },
    {
      source: { name: 'Mme.Thenardier', group: 4 },
      target: { name: 'Fantine', group: 3 },
      value: 2
    },
    {
      source: { name: 'Mme.Thenardier', group: 4 },
      target: { name: 'Valjean', group: 2 },
      value: 7
    },
    {
      source: { name: 'Thenardier', group: 4 },
      target: { name: 'Mme.Thenardier', group: 4 },
      value: 13
    },
    {
      source: { name: 'Thenardier', group: 4 },
      target: { name: 'Fantine', group: 3 },
      value: 1
    },
    {
      source: { name: 'Thenardier', group: 4 },
      target: { name: 'Valjean', group: 2 },
      value: 12
    },
    {
      source: { name: 'Cosette', group: 5 },
      target: { name: 'Mme.Thenardier', group: 4 },
      value: 4
    },
    {
      source: { name: 'Cosette', group: 5 },
      target: { name: 'Valjean', group: 2 },
      value: 31
    },
    {
      source: { name: 'Cosette', group: 5 },
      target: { name: 'Tholomyes', group: 3 },
      value: 1
    },
    {
      source: { name: 'Cosette', group: 5 },
      target: { name: 'Thenardier', group: 4 },
      value: 1
    },
    {
      source: { name: 'Javert', group: 4 },
      target: { name: 'Valjean', group: 2 },
      value: 17
    },
    {
      source: { name: 'Javert', group: 4 },
      target: { name: 'Fantine', group: 3 },
      value: 5
    },
    {
      source: { name: 'Javert', group: 4 },
      target: { name: 'Thenardier', group: 4 },
      value: 5
    },
    {
      source: { name: 'Javert', group: 4 },
      target: { name: 'Mme.Thenardier', group: 4 },
      value: 1
    },
    {
      source: { name: 'Javert', group: 4 },
      target: { name: 'Cosette', group: 5 },
      value: 1
    },
    {
      source: { name: 'Fauchelevent', group: 0 },
      target: { name: 'Valjean', group: 2 },
      value: 8
    },
    {
      source: { name: 'Fauchelevent', group: 0 },
      target: { name: 'Javert', group: 4 },
      value: 1
    },
    {
      source: { name: 'Bamatabois', group: 2 },
      target: { name: 'Fantine', group: 3 },
      value: 1
    },
    {
      source: { name: 'Bamatabois', group: 2 },
      target: { name: 'Javert', group: 4 },
      value: 1
    },
    {
      source: { name: 'Bamatabois', group: 2 },
      target: { name: 'Valjean', group: 2 },
      value: 2
    },
    {
      source: { name: 'Perpetue', group: 3 },
      target: { name: 'Fantine', group: 3 },
      value: 1
    },
    {
      source: { name: 'Simplice', group: 2 },
      target: { name: 'Perpetue', group: 3 },
      value: 2
    },
    {
      source: { name: 'Simplice', group: 2 },
      target: { name: 'Valjean', group: 2 },
      value: 3
    },
    {
      source: { name: 'Simplice', group: 2 },
      target: { name: 'Fantine', group: 3 },
      value: 2
    },
    {
      source: { name: 'Simplice', group: 2 },
      target: { name: 'Javert', group: 4 },
      value: 1
    },
    {
      source: { name: 'Scaufflaire', group: 2 },
      target: { name: 'Valjean', group: 2 },
      value: 1
    },
    {
      source: { name: 'Woman1', group: 2 },
      target: { name: 'Valjean', group: 2 },
      value: 2
    },
    {
      source: { name: 'Woman1', group: 2 },
      target: { name: 'Javert', group: 4 },
      value: 1
    },
    {
      source: { name: 'Judge', group: 2 },
      target: { name: 'Valjean', group: 2 },
      value: 3
    },
    {
      source: { name: 'Judge', group: 2 },
      target: { name: 'Bamatabois', group: 2 },
      value: 2
    },
    {
      source: { name: 'Champmathieu', group: 2 },
      target: { name: 'Valjean', group: 2 },
      value: 3
    },
    {
      source: { name: 'Champmathieu', group: 2 },
      target: { name: 'Judge', group: 2 },
      value: 3
    },
    {
      source: { name: 'Champmathieu', group: 2 },
      target: { name: 'Bamatabois', group: 2 },
      value: 2
    },
    {
      source: { name: 'Brevet', group: 2 },
      target: { name: 'Judge', group: 2 },
      value: 2
    },
    {
      source: { name: 'Brevet', group: 2 },
      target: { name: 'Champmathieu', group: 2 },
      value: 2
    },
    {
      source: { name: 'Brevet', group: 2 },
      target: { name: 'Valjean', group: 2 },
      value: 2
    },
    {
      source: { name: 'Brevet', group: 2 },
      target: { name: 'Bamatabois', group: 2 },
      value: 1
    },
    {
      source: { name: 'Chenildieu', group: 2 },
      target: { name: 'Judge', group: 2 },
      value: 2
    },
    {
      source: { name: 'Chenildieu', group: 2 },
      target: { name: 'Champmathieu', group: 2 },
      value: 2
    },
    {
      source: { name: 'Chenildieu', group: 2 },
      target: { name: 'Brevet', group: 2 },
      value: 2
    },
    {
      source: { name: 'Chenildieu', group: 2 },
      target: { name: 'Valjean', group: 2 },
      value: 2
    },
    {
      source: { name: 'Chenildieu', group: 2 },
      target: { name: 'Bamatabois', group: 2 },
      value: 1
    },
    {
      source: { name: 'Cochepaille', group: 2 },
      target: { name: 'Judge', group: 2 },
      value: 2
    },
    {
      source: { name: 'Cochepaille', group: 2 },
      target: { name: 'Champmathieu', group: 2 },
      value: 2
    },
    {
      source: { name: 'Cochepaille', group: 2 },
      target: { name: 'Brevet', group: 2 },
      value: 2
    },
    {
      source: { name: 'Cochepaille', group: 2 },
      target: { name: 'Chenildieu', group: 2 },
      value: 2
    },
    {
      source: { name: 'Cochepaille', group: 2 },
      target: { name: 'Valjean', group: 2 },
      value: 2
    },
    {
      source: { name: 'Cochepaille', group: 2 },
      target: { name: 'Bamatabois', group: 2 },
      value: 1
    },
    {
      source: { name: 'Pontmercy', group: 4 },
      target: { name: 'Thenardier', group: 4 },
      value: 1
    },
    {
      source: { name: 'Boulatruelle', group: 6 },
      target: { name: 'Thenardier', group: 4 },
      value: 1
    },
    {
      source: { name: 'Eponine', group: 4 },
      target: { name: 'Mme.Thenardier', group: 4 },
      value: 2
    },
    {
      source: { name: 'Eponine', group: 4 },
      target: { name: 'Thenardier', group: 4 },
      value: 3
    },
    {
      source: { name: 'Anzelma', group: 4 },
      target: { name: 'Eponine', group: 4 },
      value: 2
    },
    {
      source: { name: 'Anzelma', group: 4 },
      target: { name: 'Thenardier', group: 4 },
      value: 2
    },
    {
      source: { name: 'Anzelma', group: 4 },
      target: { name: 'Mme.Thenardier', group: 4 },
      value: 1
    },
    {
      source: { name: 'Woman2', group: 5 },
      target: { name: 'Valjean', group: 2 },
      value: 3
    },
    {
      source: { name: 'Woman2', group: 5 },
      target: { name: 'Cosette', group: 5 },
      value: 1
    },
    {
      source: { name: 'Woman2', group: 5 },
      target: { name: 'Javert', group: 4 },
      value: 1
    },
    {
      source: { name: 'MotherInnocent', group: 0 },
      target: { name: 'Fauchelevent', group: 0 },
      value: 3
    },
    {
      source: { name: 'MotherInnocent', group: 0 },
      target: { name: 'Valjean', group: 2 },
      value: 1
    },
    {
      source: { name: 'Gribier', group: 0 },
      target: { name: 'Fauchelevent', group: 0 },
      value: 2
    },
    {
      source: { name: 'Mme.Burgon', group: 7 },
      target: { name: 'Jondrette', group: 7 },
      value: 1
    },
    {
      source: { name: 'Gavroche', group: 8 },
      target: { name: 'Mme.Burgon', group: 7 },
      value: 2
    },
    {
      source: { name: 'Gavroche', group: 8 },
      target: { name: 'Thenardier', group: 4 },
      value: 1
    },
    {
      source: { name: 'Gavroche', group: 8 },
      target: { name: 'Javert', group: 4 },
      value: 1
    },
    {
      source: { name: 'Gavroche', group: 8 },
      target: { name: 'Valjean', group: 2 },
      value: 1
    },
    {
      source: { name: 'Gillenormand', group: 5 },
      target: { name: 'Cosette', group: 5 },
      value: 3
    },
    {
      source: { name: 'Gillenormand', group: 5 },
      target: { name: 'Valjean', group: 2 },
      value: 2
    },
    {
      source: { name: 'Magnon', group: 5 },
      target: { name: 'Gillenormand', group: 5 },
      value: 1
    },
    {
      source: { name: 'Magnon', group: 5 },
      target: { name: 'Mme.Thenardier', group: 4 },
      value: 1
    },
    {
      source: { name: 'Mlle.Gillenormand', group: 5 },
      target: { name: 'Gillenormand', group: 5 },
      value: 9
    },
    {
      source: { name: 'Mlle.Gillenormand', group: 5 },
      target: { name: 'Cosette', group: 5 },
      value: 2
    },
    {
      source: { name: 'Mlle.Gillenormand', group: 5 },
      target: { name: 'Valjean', group: 2 },
      value: 2
    },
    {
      source: { name: 'Mme.Pontmercy', group: 5 },
      target: { name: 'Mlle.Gillenormand', group: 5 },
      value: 1
    },
    {
      source: { name: 'Mme.Pontmercy', group: 5 },
      target: { name: 'Pontmercy', group: 4 },
      value: 1
    },
    {
      source: { name: 'Mlle.Vaubois', group: 5 },
      target: { name: 'Mlle.Gillenormand', group: 5 },
      value: 1
    },
    {
      source: { name: 'Lt.Gillenormand', group: 5 },
      target: { name: 'Mlle.Gillenormand', group: 5 },
      value: 2
    },
    {
      source: { name: 'Lt.Gillenormand', group: 5 },
      target: { name: 'Gillenormand', group: 5 },
      value: 1
    },
    {
      source: { name: 'Lt.Gillenormand', group: 5 },
      target: { name: 'Cosette', group: 5 },
      value: 1
    },
    {
      source: { name: 'Marius', group: 8 },
      target: { name: 'Mlle.Gillenormand', group: 5 },
      value: 6
    },
    {
      source: { name: 'Marius', group: 8 },
      target: { name: 'Gillenormand', group: 5 },
      value: 12
    },
    {
      source: { name: 'Marius', group: 8 },
      target: { name: 'Pontmercy', group: 4 },
      value: 1
    },
    {
      source: { name: 'Marius', group: 8 },
      target: { name: 'Lt.Gillenormand', group: 5 },
      value: 1
    },
    {
      source: { name: 'Marius', group: 8 },
      target: { name: 'Cosette', group: 5 },
      value: 21
    },
    {
      source: { name: 'Marius', group: 8 },
      target: { name: 'Valjean', group: 2 },
      value: 19
    },
    {
      source: { name: 'Marius', group: 8 },
      target: { name: 'Tholomyes', group: 3 },
      value: 1
    },
    {
      source: { name: 'Marius', group: 8 },
      target: { name: 'Thenardier', group: 4 },
      value: 2
    },
    {
      source: { name: 'Marius', group: 8 },
      target: { name: 'Eponine', group: 4 },
      value: 5
    },
    {
      source: { name: 'Marius', group: 8 },
      target: { name: 'Gavroche', group: 8 },
      value: 4
    },
    {
      source: { name: 'BaronessT', group: 5 },
      target: { name: 'Gillenormand', group: 5 },
      value: 1
    },
    {
      source: { name: 'BaronessT', group: 5 },
      target: { name: 'Marius', group: 8 },
      value: 1
    },
    {
      source: { name: 'Mabeuf', group: 8 },
      target: { name: 'Marius', group: 8 },
      value: 1
    },
    {
      source: { name: 'Mabeuf', group: 8 },
      target: { name: 'Eponine', group: 4 },
      value: 1
    },
    {
      source: { name: 'Mabeuf', group: 8 },
      target: { name: 'Gavroche', group: 8 },
      value: 1
    },
    {
      source: { name: 'Enjolras', group: 8 },
      target: { name: 'Marius', group: 8 },
      value: 7
    },
    {
      source: { name: 'Enjolras', group: 8 },
      target: { name: 'Gavroche', group: 8 },
      value: 7
    },
    {
      source: { name: 'Enjolras', group: 8 },
      target: { name: 'Javert', group: 4 },
      value: 6
    },
    {
      source: { name: 'Enjolras', group: 8 },
      target: { name: 'Mabeuf', group: 8 },
      value: 1
    },
    {
      source: { name: 'Enjolras', group: 8 },
      target: { name: 'Valjean', group: 2 },
      value: 4
    },
    {
      source: { name: 'Combeferre', group: 8 },
      target: { name: 'Enjolras', group: 8 },
      value: 15
    },
    {
      source: { name: 'Combeferre', group: 8 },
      target: { name: 'Marius', group: 8 },
      value: 5
    },
    {
      source: { name: 'Combeferre', group: 8 },
      target: { name: 'Gavroche', group: 8 },
      value: 6
    },
    {
      source: { name: 'Combeferre', group: 8 },
      target: { name: 'Mabeuf', group: 8 },
      value: 2
    },
    {
      source: { name: 'Prouvaire', group: 8 },
      target: { name: 'Gavroche', group: 8 },
      value: 1
    },
    {
      source: { name: 'Prouvaire', group: 8 },
      target: { name: 'Enjolras', group: 8 },
      value: 4
    },
    {
      source: { name: 'Prouvaire', group: 8 },
      target: { name: 'Combeferre', group: 8 },
      value: 2
    },
    {
      source: { name: 'Feuilly', group: 8 },
      target: { name: 'Gavroche', group: 8 },
      value: 2
    },
    {
      source: { name: 'Feuilly', group: 8 },
      target: { name: 'Enjolras', group: 8 },
      value: 6
    },
    {
      source: { name: 'Feuilly', group: 8 },
      target: { name: 'Prouvaire', group: 8 },
      value: 2
    },
    {
      source: { name: 'Feuilly', group: 8 },
      target: { name: 'Combeferre', group: 8 },
      value: 5
    },
    {
      source: { name: 'Feuilly', group: 8 },
      target: { name: 'Mabeuf', group: 8 },
      value: 1
    },
    {
      source: { name: 'Feuilly', group: 8 },
      target: { name: 'Marius', group: 8 },
      value: 1
    },
    {
      source: { name: 'Courfeyrac', group: 8 },
      target: { name: 'Marius', group: 8 },
      value: 9
    },
    {
      source: { name: 'Courfeyrac', group: 8 },
      target: { name: 'Enjolras', group: 8 },
      value: 17
    },
    {
      source: { name: 'Courfeyrac', group: 8 },
      target: { name: 'Combeferre', group: 8 },
      value: 13
    },
    {
      source: { name: 'Courfeyrac', group: 8 },
      target: { name: 'Gavroche', group: 8 },
      value: 7
    },
    {
      source: { name: 'Courfeyrac', group: 8 },
      target: { name: 'Mabeuf', group: 8 },
      value: 2
    },
    {
      source: { name: 'Courfeyrac', group: 8 },
      target: { name: 'Eponine', group: 4 },
      value: 1
    },
    {
      source: { name: 'Courfeyrac', group: 8 },
      target: { name: 'Feuilly', group: 8 },
      value: 6
    },
    {
      source: { name: 'Courfeyrac', group: 8 },
      target: { name: 'Prouvaire', group: 8 },
      value: 3
    },
    {
      source: { name: 'Bahorel', group: 8 },
      target: { name: 'Combeferre', group: 8 },
      value: 5
    },
    {
      source: { name: 'Bahorel', group: 8 },
      target: { name: 'Gavroche', group: 8 },
      value: 5
    },
    {
      source: { name: 'Bahorel', group: 8 },
      target: { name: 'Courfeyrac', group: 8 },
      value: 6
    },
    {
      source: { name: 'Bahorel', group: 8 },
      target: { name: 'Mabeuf', group: 8 },
      value: 2
    },
    {
      source: { name: 'Bahorel', group: 8 },
      target: { name: 'Enjolras', group: 8 },
      value: 4
    },
    {
      source: { name: 'Bahorel', group: 8 },
      target: { name: 'Feuilly', group: 8 },
      value: 3
    },
    {
      source: { name: 'Bahorel', group: 8 },
      target: { name: 'Prouvaire', group: 8 },
      value: 2
    },
    {
      source: { name: 'Bahorel', group: 8 },
      target: { name: 'Marius', group: 8 },
      value: 1
    },
    {
      source: { name: 'Bossuet', group: 8 },
      target: { name: 'Marius', group: 8 },
      value: 5
    },
    {
      source: { name: 'Bossuet', group: 8 },
      target: { name: 'Courfeyrac', group: 8 },
      value: 12
    },
    {
      source: { name: 'Bossuet', group: 8 },
      target: { name: 'Gavroche', group: 8 },
      value: 5
    },
    {
      source: { name: 'Bossuet', group: 8 },
      target: { name: 'Bahorel', group: 8 },
      value: 4
    },
    {
      source: { name: 'Bossuet', group: 8 },
      target: { name: 'Enjolras', group: 8 },
      value: 10
    },
    {
      source: { name: 'Bossuet', group: 8 },
      target: { name: 'Feuilly', group: 8 },
      value: 6
    },
    {
      source: { name: 'Bossuet', group: 8 },
      target: { name: 'Prouvaire', group: 8 },
      value: 2
    },
    {
      source: { name: 'Bossuet', group: 8 },
      target: { name: 'Combeferre', group: 8 },
      value: 9
    },
    {
      source: { name: 'Bossuet', group: 8 },
      target: { name: 'Mabeuf', group: 8 },
      value: 1
    },
    {
      source: { name: 'Bossuet', group: 8 },
      target: { name: 'Valjean', group: 2 },
      value: 1
    },
    {
      source: { name: 'Joly', group: 8 },
      target: { name: 'Bahorel', group: 8 },
      value: 5
    },
    {
      source: { name: 'Joly', group: 8 },
      target: { name: 'Bossuet', group: 8 },
      value: 7
    },
    {
      source: { name: 'Joly', group: 8 },
      target: { name: 'Gavroche', group: 8 },
      value: 3
    },
    {
      source: { name: 'Joly', group: 8 },
      target: { name: 'Courfeyrac', group: 8 },
      value: 5
    },
    {
      source: { name: 'Joly', group: 8 },
      target: { name: 'Enjolras', group: 8 },
      value: 5
    },
    {
      source: { name: 'Joly', group: 8 },
      target: { name: 'Feuilly', group: 8 },
      value: 5
    },
    {
      source: { name: 'Joly', group: 8 },
      target: { name: 'Prouvaire', group: 8 },
      value: 2
    },
    {
      source: { name: 'Joly', group: 8 },
      target: { name: 'Combeferre', group: 8 },
      value: 5
    },
    {
      source: { name: 'Joly', group: 8 },
      target: { name: 'Mabeuf', group: 8 },
      value: 1
    },
    {
      source: { name: 'Joly', group: 8 },
      target: { name: 'Marius', group: 8 },
      value: 2
    },
    {
      source: { name: 'Grantaire', group: 8 },
      target: { name: 'Bossuet', group: 8 },
      value: 3
    },
    {
      source: { name: 'Grantaire', group: 8 },
      target: { name: 'Enjolras', group: 8 },
      value: 3
    },
    {
      source: { name: 'Grantaire', group: 8 },
      target: { name: 'Combeferre', group: 8 },
      value: 1
    },
    {
      source: { name: 'Grantaire', group: 8 },
      target: { name: 'Courfeyrac', group: 8 },
      value: 2
    },
    {
      source: { name: 'Grantaire', group: 8 },
      target: { name: 'Joly', group: 8 },
      value: 2
    },
    {
      source: { name: 'Grantaire', group: 8 },
      target: { name: 'Gavroche', group: 8 },
      value: 1
    },
    {
      source: { name: 'Grantaire', group: 8 },
      target: { name: 'Bahorel', group: 8 },
      value: 1
    },
    {
      source: { name: 'Grantaire', group: 8 },
      target: { name: 'Feuilly', group: 8 },
      value: 1
    },
    {
      source: { name: 'Grantaire', group: 8 },
      target: { name: 'Prouvaire', group: 8 },
      value: 1
    },
    {
      source: { name: 'MotherPlutarch', group: 9 },
      target: { name: 'Mabeuf', group: 8 },
      value: 3
    },
    {
      source: { name: 'Gueulemer', group: 4 },
      target: { name: 'Thenardier', group: 4 },
      value: 5
    },
    {
      source: { name: 'Gueulemer', group: 4 },
      target: { name: 'Valjean', group: 2 },
      value: 1
    },
    {
      source: { name: 'Gueulemer', group: 4 },
      target: { name: 'Mme.Thenardier', group: 4 },
      value: 1
    },
    {
      source: { name: 'Gueulemer', group: 4 },
      target: { name: 'Javert', group: 4 },
      value: 1
    },
    {
      source: { name: 'Gueulemer', group: 4 },
      target: { name: 'Gavroche', group: 8 },
      value: 1
    },
    {
      source: { name: 'Gueulemer', group: 4 },
      target: { name: 'Eponine', group: 4 },
      value: 1
    },
    {
      source: { name: 'Babet', group: 4 },
      target: { name: 'Thenardier', group: 4 },
      value: 6
    },
    {
      source: { name: 'Babet', group: 4 },
      target: { name: 'Gueulemer', group: 4 },
      value: 6
    },
    {
      source: { name: 'Babet', group: 4 },
      target: { name: 'Valjean', group: 2 },
      value: 1
    },
    {
      source: { name: 'Babet', group: 4 },
      target: { name: 'Mme.Thenardier', group: 4 },
      value: 1
    },
    {
      source: { name: 'Babet', group: 4 },
      target: { name: 'Javert', group: 4 },
      value: 2
    },
    {
      source: { name: 'Babet', group: 4 },
      target: { name: 'Gavroche', group: 8 },
      value: 1
    },
    {
      source: { name: 'Babet', group: 4 },
      target: { name: 'Eponine', group: 4 },
      value: 1
    },
    {
      source: { name: 'Claquesous', group: 4 },
      target: { name: 'Thenardier', group: 4 },
      value: 4
    },
    {
      source: { name: 'Claquesous', group: 4 },
      target: { name: 'Babet', group: 4 },
      value: 4
    },
    {
      source: { name: 'Claquesous', group: 4 },
      target: { name: 'Gueulemer', group: 4 },
      value: 4
    },
    {
      source: { name: 'Claquesous', group: 4 },
      target: { name: 'Valjean', group: 2 },
      value: 1
    },
    {
      source: { name: 'Claquesous', group: 4 },
      target: { name: 'Mme.Thenardier', group: 4 },
      value: 1
    },
    {
      source: { name: 'Claquesous', group: 4 },
      target: { name: 'Javert', group: 4 },
      value: 1
    },
    {
      source: { name: 'Claquesous', group: 4 },
      target: { name: 'Eponine', group: 4 },
      value: 1
    },
    {
      source: { name: 'Claquesous', group: 4 },
      target: { name: 'Enjolras', group: 8 },
      value: 1
    },
    {
      source: { name: 'Montparnasse', group: 4 },
      target: { name: 'Javert', group: 4 },
      value: 1
    },
    {
      source: { name: 'Montparnasse', group: 4 },
      target: { name: 'Babet', group: 4 },
      value: 2
    },
    {
      source: { name: 'Montparnasse', group: 4 },
      target: { name: 'Gueulemer', group: 4 },
      value: 2
    },
    {
      source: { name: 'Montparnasse', group: 4 },
      target: { name: 'Claquesous', group: 4 },
      value: 2
    },
    {
      source: { name: 'Montparnasse', group: 4 },
      target: { name: 'Valjean', group: 2 },
      value: 1
    },
    {
      source: { name: 'Montparnasse', group: 4 },
      target: { name: 'Gavroche', group: 8 },
      value: 1
    },
    {
      source: { name: 'Montparnasse', group: 4 },
      target: { name: 'Eponine', group: 4 },
      value: 1
    },
    {
      source: { name: 'Montparnasse', group: 4 },
      target: { name: 'Thenardier', group: 4 },
      value: 1
    },
    {
      source: { name: 'Toussaint', group: 5 },
      target: { name: 'Cosette', group: 5 },
      value: 2
    },
    {
      source: { name: 'Toussaint', group: 5 },
      target: { name: 'Javert', group: 4 },
      value: 1
    },
    {
      source: { name: 'Toussaint', group: 5 },
      target: { name: 'Valjean', group: 2 },
      value: 1
    },
    {
      source: { name: 'Child1', group: 10 },
      target: { name: 'Gavroche', group: 8 },
      value: 2
    },
    {
      source: { name: 'Child2', group: 10 },
      target: { name: 'Gavroche', group: 8 },
      value: 2
    },
    {
      source: { name: 'Child2', group: 10 },
      target: { name: 'Child1', group: 10 },
      value: 3
    },
    {
      source: { name: 'Brujon', group: 4 },
      target: { name: 'Babet', group: 4 },
      value: 3
    },
    {
      source: { name: 'Brujon', group: 4 },
      target: { name: 'Gueulemer', group: 4 },
      value: 3
    },
    {
      source: { name: 'Brujon', group: 4 },
      target: { name: 'Thenardier', group: 4 },
      value: 3
    },
    {
      source: { name: 'Brujon', group: 4 },
      target: { name: 'Gavroche', group: 8 },
      value: 1
    },
    {
      source: { name: 'Brujon', group: 4 },
      target: { name: 'Eponine', group: 4 },
      value: 1
    },
    {
      source: { name: 'Brujon', group: 4 },
      target: { name: 'Claquesous', group: 4 },
      value: 1
    },
    {
      source: { name: 'Brujon', group: 4 },
      target: { name: 'Montparnasse', group: 4 },
      value: 1
    },
    {
      source: { name: 'Mme.Hucheloup', group: 8 },
      target: { name: 'Bossuet', group: 8 },
      value: 1
    },
    {
      source: { name: 'Mme.Hucheloup', group: 8 },
      target: { name: 'Joly', group: 8 },
      value: 1
    },
    {
      source: { name: 'Mme.Hucheloup', group: 8 },
      target: { name: 'Grantaire', group: 8 },
      value: 1
    },
    {
      source: { name: 'Mme.Hucheloup', group: 8 },
      target: { name: 'Bahorel', group: 8 },
      value: 1
    },
    {
      source: { name: 'Mme.Hucheloup', group: 8 },
      target: { name: 'Courfeyrac', group: 8 },
      value: 1
    },
    {
      source: { name: 'Mme.Hucheloup', group: 8 },
      target: { name: 'Gavroche', group: 8 },
      value: 1
    },
    {
      source: { name: 'Mme.Hucheloup', group: 8 },
      target: { name: 'Enjolras', group: 8 },
      value: 1
    }
  ],
  size: [700, 700],
  margin: { left: 60, top: 60, bottom: 10, right: 10 },
  networkType: 'matrix',
  nodeIDAccessor: 'name',
  nodeStyle: { fill: 'none', stroke: '#DDD' },
  edgeStyle: d => ({
    fill: theme[d.source.group + 1],
    stroke: theme[d.source.group + 1],
    fillOpacity: 0.75
  }),
  hoverAnnotation: [
    { type: 'frame-hover' },
    {
      type: 'highlight',
      style: { fill: '#ac58e5', fillOpacity: 0.25, stroke: '#E0488B' }
    }
  ],
  nodeLabels: true
};

export default () => {
  return <NetworkFrame {...frameProps} />;
};
