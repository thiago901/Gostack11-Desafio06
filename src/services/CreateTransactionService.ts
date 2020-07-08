import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import repositoryTransaction from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // TODO
    const trasactionRepository = getCustomRepository(repositoryTransaction);
    const categoryRepository = getRepository(Category);
    const balance = await trasactionRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError("Outcome can't be greater than income");
    }

    let categoryExist = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoryExist) {
      categoryExist = categoryRepository.create({ title: category });
      await categoryRepository.save(categoryExist);
    }
    const transaction = trasactionRepository.create({
      title,
      value,
      category_id: categoryExist?.id,
      type,
    });
    await trasactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
