export const ExceptionFactory = ({ code, entity, sqlMessage, column }) => {
  const database = {
    ER_DUP_ENTRY: `Não é possível cadastrar ${entity}, campo ${column} deve ser único`,
  };

  return database?.[code] ?? sqlMessage;
};
