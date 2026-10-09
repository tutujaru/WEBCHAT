import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Paper,
  Grid,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Typography,
  Box,
  Chip,
  Tooltip
} from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

import {
  Edit as EditIcon,
  HelpOutline as HelpOutlineIcon,
  SaveOutlined,
  DeleteOutline,
  ClearOutlined,
  PlayCircleOutlineOutlined
} from "@material-ui/icons";

import { toast } from "react-toastify";
import useHelps from "../../hooks/useHelps";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%"
  },
  mainPaper: {
    width: "100%",
    flex: 1,
    padding: theme.spacing(3),
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
    border: "1px solid #f1f5f9"
  },
  // Sub-card moderno para o formulário
  formCard: {
    padding: theme.spacing(3),
    borderRadius: "14px",
    backgroundColor: "#f8fafc",
    border: "1px solid #f1f5f9",
    marginBottom: theme.spacing(3)
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(0.5),
    "& svg": {
      color: "#3b82f6",
      fontSize: "1.25rem"
    }
  },
  sectionTitle: {
    fontWeight: 700,
    color: "#0f172a",
    fontSize: "1rem"
  },
  sectionDescription: {
    color: "#64748b",
    fontSize: "0.85rem",
    marginBottom: theme.spacing(3)
  },
  fullWidth: {
    width: "100%"
  },
  // Campos modernizados
  selectContainer: {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      backgroundColor: "#ffffff",
      "& fieldset": {
        borderColor: "#e2e8f0"
      },
      "&:hover fieldset": {
        borderColor: "#cbd5e1"
      },
      "&.Mui-focused fieldset": {
        borderColor: "#3b82f6",
        borderWidth: "2px"
      }
    },
    "& .MuiInputLabel-root": {
      color: "#64748b"
    }
  },
  tableContainer: {
    width: "100%",
    overflowX: "auto",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    border: "1px solid #f1f5f9",
    ...theme.scrollbarStyles
  },
  // Cabeçalho da tabela moderno
  tableHead: {
    backgroundColor: "#f8fafc",
    "& th": {
      borderBottom: "1px solid #e2e8f0",
      fontSize: "0.7rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      color: "#64748b",
      padding: theme.spacing(2, 1.5),
      whiteSpace: "nowrap"
    }
  },
  // Linha da tabela moderna
  tableRow: {
    transition: "background-color 0.15s ease-in-out",
    "& td": {
      borderBottom: "1px solid #f1f5f9",
      padding: theme.spacing(1.5),
      fontSize: "0.875rem",
      color: "#334155"
    },
    "&:hover": {
      backgroundColor: "#f8fafc"
    },
    "&:last-child td": {
      borderBottom: "none"
    }
  },
  // ID badge
  idBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "28px",
    height: "28px",
    padding: "0 6px",
    borderRadius: "8px",
    backgroundColor: "#eff6ff",
    color: "#3b82f6",
    fontWeight: 700,
    fontSize: "0.7rem"
  },
  // Botão de editar
  editBtn: {
    padding: theme.spacing(0.75),
    borderRadius: "10px",
    color: "#64748b",
    transition: "all 0.2s ease",
    "& svg": {
      fontSize: "18px"
    },
    "&:hover": {
      backgroundColor: "#eff6ff",
      color: "#3b82f6"
    }
  },
  // Chip de vídeo
  videoChip: {
    backgroundColor: "#f3e8ff",
    color: "#6b21a8",
    fontWeight: 600,
    fontSize: "0.7rem",
    height: "22px",
    borderRadius: "6px",
    fontFamily: "monospace"
  },
  // Botões modernos
  primaryButton: {
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(1, 3),
    boxShadow: "0px 4px 12px rgba(59, 130, 246, 0.25)",
    transition: "all 0.2s ease",
    "&:hover": {
      boxShadow: "0px 6px 16px rgba(59, 130, 246, 0.35)",
      transform: "translateY(-1px)"
    }
  },
  outlinedButton: {
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(1, 3),
    borderColor: "#cbd5e1",
    color: "#475569",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: "#3b82f6",
      backgroundColor: "#eff6ff",
      color: "#3b82f6"
    }
  },
  dangerButton: {
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(1, 3),
    backgroundColor: "#ef4444",
    color: "#ffffff",
    boxShadow: "0px 4px 12px rgba(239, 68, 68, 0.25)",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#dc2626",
      boxShadow: "0px 6px 16px rgba(239, 68, 68, 0.35)",
      transform: "translateY(-1px)"
    }
  },
  textRight: {
    textAlign: "right"
  },
  // Empty state
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(8, 2),
    textAlign: "center"
  },
  emptyStateIcon: {
    fontSize: "4rem",
    color: "#cbd5e1",
    marginBottom: theme.spacing(2)
  },
  emptyStateText: {
    color: "#64748b",
    fontWeight: 500
  },
  // Ações do formulário
  buttonRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    justifyContent: "flex-end"
  }
}));

export function HelpManagerForm(props) {
  const { onSubmit, onDelete, onCancel, initialValue, loading } = props;
  const classes = useStyles();

  const [record, setRecord] = useState(initialValue);

  useEffect(() => {
    setRecord(initialValue);
  }, [initialValue]);

  const handleSubmit = async data => {
    onSubmit(data);
  };

  return (
    <Box className={classes.formCard}>
      {/* Cabeçalho da Seção */}
      <Box className={classes.sectionHeader}>
        <HelpOutlineIcon />
        <Typography className={classes.sectionTitle}>
          {record.id !== undefined
            ? "Editar Registro de Ajuda"
            : "Cadastrar Novo Registro de Ajuda"}
        </Typography>
      </Box>
      <Typography className={classes.sectionDescription}>
        {record.id !== undefined
          ? "Atualize as informações do registro selecionado."
          : "Preencha os dados abaixo para adicionar um novo tutorial ou vídeo de ajuda."}
      </Typography>

      <Formik
        enableReinitialize
        className={classes.fullWidth}
        initialValues={record}
        onSubmit={(values, { resetForm }) =>
          setTimeout(() => {
            handleSubmit(values);
            resetForm();
          }, 500)
        }
      >
        {values => (
          <Form className={classes.fullWidth}>
            <Grid spacing={2} container>
              <Grid xs={12} sm={6} md={3} item>
                <Field
                  as={TextField}
                  label="Título"
                  name="title"
                  variant="outlined"
                  className={classes.selectContainer}
                  margin="dense"
                  fullWidth
                />
              </Grid>
              <Grid xs={12} sm={6} md={3} item>
                <Field
                  as={TextField}
                  label="Código do Vídeo"
                  name="video"
                  variant="outlined"
                  className={classes.selectContainer}
                  margin="dense"
                  fullWidth
                />
              </Grid>
              <Grid xs={12} md={6} item>
                <Field
                  as={TextField}
                  label="Descrição"
                  name="description"
                  variant="outlined"
                  className={classes.selectContainer}
                  margin="dense"
                  fullWidth
                />
              </Grid>
              <Grid xs={12} item>
                <div className={classes.buttonRow}>
                  <ButtonWithSpinner
                    className={classes.outlinedButton}
                    loading={loading}
                    onClick={() => onCancel()}
                    variant="outlined"
                    startIcon={<ClearOutlined />}
                  >
                    Limpar
                  </ButtonWithSpinner>
                  {record.id !== undefined ? (
                    <ButtonWithSpinner
                      className={classes.dangerButton}
                      loading={loading}
                      onClick={() => onDelete(record)}
                      variant="contained"
                      startIcon={<DeleteOutline />}
                    >
                      Excluir
                    </ButtonWithSpinner>
                  ) : null}
                  <ButtonWithSpinner
                    className={classes.primaryButton}
                    loading={loading}
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveOutlined />}
                  >
                    Salvar
                  </ButtonWithSpinner>
                </div>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

export function HelpsManagerGrid(props) {
  const { records, onSelect } = props;
  const classes = useStyles();

  if (!records || records.length === 0) {
    return (
      <Paper className={classes.tableContainer} elevation={0}>
        <div className={classes.emptyState}>
          <HelpOutlineIcon className={classes.emptyStateIcon} />
          <Typography variant="h6" className={classes.emptyStateText}>
            Nenhum registro de ajuda ainda
          </Typography>
          <Typography
            variant="body2"
            style={{ color: "#94a3b8", marginTop: 8 }}
          >
            Preencha o formulário acima para adicionar o primeiro tutorial.
          </Typography>
        </div>
      </Paper>
    );
  }

  return (
    <Paper className={classes.tableContainer} elevation={0}>
      <Table size="small" aria-label="a dense table">
        <TableHead className={classes.tableHead}>
          <TableRow>
            <TableCell align="center" style={{ width: "1%" }}>
              #
            </TableCell>
            <TableCell align="left">Título</TableCell>
            <TableCell align="left">Descrição</TableCell>
            <TableCell align="left">Vídeo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map(row => (
            <TableRow key={row.id} className={classes.tableRow}>
              <TableCell align="center">
                <Tooltip title="Editar" arrow>
                  <IconButton
                    className={classes.editBtn}
                    onClick={() => onSelect(row)}
                    aria-label="edit"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell
                align="left"
                style={{ fontWeight: 600, color: "#0f172a" }}
              >
                {row.title || "-"}
              </TableCell>
              <TableCell align="left" style={{ color: "#64748b" }}>
                {row.description || "-"}
              </TableCell>
              <TableCell align="left">
                {row.video ? (
                  <Chip
                    icon={<PlayCircleOutlineOutlined style={{ fontSize: 14 }} />}
                    label={row.video}
                    className={classes.videoChip}
                    size="small"
                  />
                ) : (
                  "-"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default function HelpsManager() {
  const classes = useStyles();
  const { list, save, update, remove } = useHelps();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState({
    title: "",
    description: "",
    video: ""
  });

  useEffect(() => {
    async function fetchData() {
      await loadHelps();
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHelps = async () => {
    setLoading(true);
    try {
      const helpList = await list();
      setRecords(helpList);
    } catch (e) {
      toast.error("Não foi possível carregar a lista de registros");
    }
    setLoading(false);
  };

  const handleSubmit = async data => {
    setLoading(true);
    try {
      if (data.id !== undefined) {
        await update(data);
      } else {
        await save(data);
      }
      await loadHelps();
      handleCancel();
      toast.success("Operação realizada com sucesso!");
    } catch (e) {
      toast.error(
        "Não foi possível realizar a operação. Verifique se já existe uma helpo com o mesmo nome ou se os campos foram preenchidos corretamente"
      );
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await remove(record.id);
      await loadHelps();
      handleCancel();
      toast.success("Operação realizada com sucesso!");
    } catch (e) {
      toast.error("Não foi possível realizar a operação");
    }
    setLoading(false);
  };

  const handleOpenDeleteDialog = () => {
    setShowConfirmDialog(true);
  };

  const handleCancel = () => {
    setRecord({
      title: "",
      description: "",
      video: ""
    });
  };

  const handleSelect = data => {
    setRecord({
      id: data.id,
      title: data.title || "",
      description: data.description || "",
      video: data.video || ""
    });
  };

  return (
    <Paper className={classes.mainPaper} elevation={0}>
      <Grid spacing={3} container>
        <Grid xs={12} item>
          <HelpManagerForm
            initialValue={record}
            onDelete={handleOpenDeleteDialog}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </Grid>
        <Grid xs={12} item>
          <HelpsManagerGrid records={records} onSelect={handleSelect} />
        </Grid>
      </Grid>
      <ConfirmationModal
        title="Exclusão de Registro"
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => handleDelete()}
      >
        Deseja realmente excluir esse registro?
      </ConfirmationModal>
    </Paper>
  );
}