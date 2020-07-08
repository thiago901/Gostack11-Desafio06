import { getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import folderUpload from '../config/upload';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    // TODO
    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);
    const pathFileCsv = path.join(folderUpload.folderUpload, filename);
    const readCsvStrem = fs.createReadStream(pathFileCsv);
    const categories: string[] = [];
    const transactions: CSVTransaction[] = [];

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });
    const parseCSV = readCsvStrem.pipe(parseStream);

    parseCSV.on('data', l => {
      const [title, type, value, category] = l;
      categories.push(category.trim());
      transactions.push({
        title,
        type,
        value,
        category,
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });
    const existsCategories = await categoryRepository.find({
      where: { title: In(categories) },
    });

    const existsCategoriesTitles = existsCategories.map(
      (category: Category) => category.title,
    );

    const addCategoriesTitles = categories
      .filter(cat => !existsCategoriesTitles.includes(cat))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      addCategoriesTitles.map(title => ({
        title,
      })),
    );
    await categoryRepository.save(newCategories);

    const finalCategory = [...newCategories, ...existsCategories];

    const createTransaction = transactionRepository.create(
      transactions.map(t => ({
        title: t.title,
        type: t.type,
        value: t.value,
        category_id: finalCategory.find(cat => cat.title === t.category)?.id,
      })),
    );
    await transactionRepository.save(createTransaction);
    await fs.promises.unlink(pathFileCsv);
    return createTransaction;
  }
}

export default ImportTransactionsService;
