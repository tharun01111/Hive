import {
  getProjectColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
} from "../services/kanban.service.js";
import { handle } from "../utils/controllerHandler.js";

export const getColumnsController = handle(async (req, res) => {
  const columns = await getProjectColumns(req.params.projectId);
  return res.status(200).json({ columns });
});

export const createColumnController = handle(async (req, res) => {
  const { name } = req.body;
  const column = await createColumn({ name, projectId: req.params.projectId });
  return res.status(201).json({ column });
});

export const updateColumnController = handle(async (req, res) => {
  const { name } = req.body;
  const column = await updateColumn(req.params.projectId, req.params.columnId, {
    name,
  });
  return res.status(200).json({ column });
});

export const deleteColumnController = handle(async (req, res) => {
  await deleteColumn(req.params.projectId, req.params.columnId);
  return res.status(200).json({ message: "Column deleted successfully" });
});

export const reorderColumnsController = handle(async (req, res) => {
  const { columns } = req.body;
  await reorderColumns(req.params.projectId, columns);
  return res.status(200).json({ message: "Columns reordered" });
});
