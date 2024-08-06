import { issue } from '../rpc/issue';
import { mint } from '../rpc/mint';
import { transfer } from '../rpc/transfer';

import { name } from '../rpc/collection-name';
import { symbol } from '../rpc/collection-symbol';
import { totalSupply } from '../rpc/collection-totalsupply';
import { getInfo } from '../rpc/get-info';
import { balanceOf } from '../rpc/get-balance';
import { listItem } from '../rpc/get-listItem';
import { ownerOf } from '../rpc/get-owner';

export = {
  issue,
  mint,
  transfer,
  name,
  symbol,
  totalSupply,
  getInfo,
  balanceOf,
  listItem,
  ownerOf,
};
