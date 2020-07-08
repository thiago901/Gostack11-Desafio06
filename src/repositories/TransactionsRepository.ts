import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    // TODO
    const income = await this.find({
      where: { type: 'income' },
    });
    const outcome = await this.find({
      where: { type: 'outcome' },
    });

    const sumIncome = income.reduce((t, i) => {
      return t + Number(i.value);
    }, 0);
    const sumOutcome = outcome.reduce((t, i) => {
      return t + Number(i.value);
    }, 0);
    const total = sumIncome - sumOutcome;

    return {
      income: sumIncome,
      outcome: sumOutcome,
      total,
    };
  }
}

export default TransactionsRepository;
