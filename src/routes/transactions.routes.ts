import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import uploadConfig from '../config/upload';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  // TODO
  const repository = getCustomRepository(TransactionsRepository);
  const balance = await repository.getBalance();
  const transactions = await repository.find();
  return response.json({ transactions, balance });
});

const upload = multer(uploadConfig);
transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({
    category,
    type,
    title,
    value,
  });
  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(id);
  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    // TODO
    // console.log(request);
    const importTransactionsService = new ImportTransactionsService();
    const trasactions = await importTransactionsService.execute(
      request.file.filename,
    );

    return response.json(trasactions);
  },
);

export default transactionsRouter;
