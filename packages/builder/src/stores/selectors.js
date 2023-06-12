export const findDatasource = (datasources, id) =>
  datasources.list.find(datasource => datasource._id === id)
