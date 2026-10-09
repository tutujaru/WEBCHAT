import React, { useState, useEffect, useContext } from "react";
import {
  makeStyles,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Select,
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
  BusinessOutlined,
  AddCircleOutline,
  SaveOutlined,
  DeleteOutline,
  VpnKeyOutlined,
  EventOutlined,
  PersonOutline
} from "@material-ui/icons";

import { toast } from "react-toastify";
import useCompanies from "../../hooks/useCompanies";
import usePlans from "../../hooks/usePlans";
import ModalUsers from "../ModalUsers";
import api from "../../services/api";
import { head, isArray, has } from "lodash";
import { useDate } from "../../hooks/useDate";
import useSettings from "../../hooks/useSettings";
import { SelectLanguage } from "../SelectLanguage";
import { i18n } from "../../translate/i18n";

import moment from "moment";

import { AuthContext } from "../../context/Auth/AuthContext";

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
  tableContainer: {
    width: "100%",
    overflowX: "auto",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    border: "1px solid #f1f5f9",
    ...theme.scrollbarStyles
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
  // Status da linha
  inactive: {
    opacity: 0.5
  },
  gracePeriod: {
    backgroundColor: "#fef2f2",
    "& td:first-child": {
      borderLeft: "4px solid #ef4444"
    },
    "&:hover": {
      backgroundColor: "#fee2e2 !important"
    }
  },
  almostDue: {
    backgroundColor: "#fffbeb",
    "& td:first-child": {
      borderLeft: "4px solid #f59e0b"
    },
    "&:hover": {
      backgroundColor: "#fef3c7 !important"
    }
  },
  active: {},
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
  // Chip de status
  statusChipEnabled: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    fontWeight: 600,
    fontSize: "0.7rem",
    height: "22px",
    borderRadius: "6px"
  },
  statusChipDisabled: {
    backgroundColor: "#f1f5f9",
    color: "#64748b",
    fontWeight: 600,
    fontSize: "0.7rem",
    height: "22px",
    borderRadius: "6px"
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
  secondaryButton: {
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(1, 3),
    backgroundColor: "#8b5cf6",
    color: "#ffffff",
    boxShadow: "0px 4px 12px rgba(139, 92, 246, 0.25)",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#7c3aed",
      boxShadow: "0px 6px 16px rgba(139, 92, 246, 0.35)",
      transform: "translateY(-1px)"
    }
  },
  textRight: {
    textAlign: "right"
  },
  row: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  buttonContainer: {
    textAlign: "right",
    padding: theme.spacing(1)
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
  // Ações da linha
  buttonRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    justifyContent: "flex-end"
  }
}));

export function CompanyForm(props) {
  const { onSubmit, onDelete, onImpersonate, onCancel, initialValue, loading } =
    props;
  const classes = useStyles();
  const [plans, setPlans] = useState([]);
  const [modalUser, setModalUser] = useState(false);
  const [firstUser, setFirstUser] = useState({});

  const [record, setRecord] = useState({
    name: "",
    email: "",
    phone: "",
    language: "",
    planId: "",
    status: true,
    campaignsEnabled: false,
    dueDate: "",
    recurrence: "",
    ...initialValue
  });

  const { list: listPlans } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const list = await listPlans();
      setPlans(list);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setRecord(prev => {
      if (moment(initialValue).isValid()) {
        initialValue.dueDate = moment(initialValue.dueDate).format(
          "YYYY-MM-DD"
        );
      }
      return {
        ...prev,
        ...initialValue
      };
    });
  }, [initialValue]);

  const handleSubmit = async data => {
    if (data.dueDate === "" || moment(data.dueDate).isValid() === false) {
      data.dueDate = null;
    }
    onSubmit(data);
    setRecord({ ...initialValue, dueDate: "" });
  };

  const handleOpenModalUsers = async () => {
    try {
      const { data } = await api.get("/users/list", {
        params: {
          companyId: initialValue.id
        }
      });
      if (isArray(data) && data.length) {
        setFirstUser(head(data));
      }
      setModalUser(true);
    } catch (e) {
      toast.error(e);
    }
  };

  const handleCloseModalUsers = () => {
    setFirstUser({});
    setModalUser(false);
  };

  const incrementDueDate = () => {
    const data = { ...record };
    if (data.dueDate !== "" && data.dueDate !== null) {
      switch (data.recurrence) {
        case "MENSAL":
          data.dueDate = moment(data.dueDate)
            .add(1, "month")
            .format("YYYY-MM-DD");
          break;
        case "BIMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(2, "month")
            .format("YYYY-MM-DD");
          break;
        case "TRIMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(3, "month")
            .format("YYYY-MM-DD");
          break;
        case "SEMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(6, "month")
            .format("YYYY-MM-DD");
          break;
        case "ANUAL":
          data.dueDate = moment(data.dueDate)
            .add(12, "month")
            .format("YYYY-MM-DD");
          break;
        default:
          break;
      }
    }
    setRecord(data);
  };

  return (
    <>
      <ModalUsers
        userId={firstUser.id}
        companyId={initialValue.id}
        open={modalUser}
        onClose={handleCloseModalUsers}
      />
      <Box className={classes.formCard}>
        {/* Cabeçalho da Seção */}
        <Box className={classes.sectionHeader}>
          <BusinessOutlined />
          <Typography className={classes.sectionTitle}>
            {record.id !== undefined
              ? "Editar Empresa"
              : "Cadastrar Nova Empresa"}
          </Typography>
        </Box>
        <Typography className={classes.sectionDescription}>
          {record.id !== undefined
            ? "Atualize as informações da empresa selecionada."
            : "Preencha os dados abaixo para cadastrar uma nova empresa no sistema."}
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
          {(values, setValues) => (
            <Form className={classes.fullWidth}>
              <Grid spacing={2} container>
                <Grid xs={12} sm={6} md={4} item>
                  <Field
                    as={TextField}
                    label={i18n.t("common.name")}
                    name="name"
                    variant="outlined"
                    className={classes.selectContainer}
                    margin="dense"
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} sm={6} md={4} item>
                  <Field
                    as={TextField}
                    label={i18n.t("common.email")}
                    name="email"
                    variant="outlined"
                    className={classes.selectContainer}
                    margin="dense"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid xs={12} sm={6} md={2} item>
                  <Field
                    as={TextField}
                    label={i18n.t("common.phone")}
                    name="phone"
                    variant="outlined"
                    className={classes.selectContainer}
                    margin="dense"
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} sm={6} md={2} item>
                  <Field
                    as={SelectLanguage}
                    name="language"
                    fullWidth
                    variant="outlined"
                    margin="dense"
                  />
                </Grid>
                <Grid xs={12} sm={6} md={2} item>
                  <FormControl
                    margin="dense"
                    variant="outlined"
                    fullWidth
                    className={classes.selectContainer}
                  >
                    <InputLabel htmlFor="plan-selection">
                      {i18n.t("companies.form.plan")}
                    </InputLabel>
                    <Field
                      as={Select}
                      id="plan-selection"
                      label={i18n.t("companies.form.plan")}
                      labelId="plan-selection-label"
                      name="planId"
                      margin="dense"
                      required
                    >
                      {plans.map((plan, key) => (
                        <MenuItem key={key} value={plan.id}>
                          {plan.name}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6} md={2} item>
                  <FormControl
                    margin="dense"
                    variant="outlined"
                    fullWidth
                    className={classes.selectContainer}
                  >
                    <InputLabel htmlFor="status-selection">
                      {i18n.t("common.status")}
                    </InputLabel>
                    <Field
                      as={Select}
                      id="status-selection"
                      label={i18n.t("common.status")}
                      labelId="status-selection-label"
                      name="status"
                      margin="dense"
                    >
                      <MenuItem value={true}>{i18n.t("common.yes")}</MenuItem>
                      <MenuItem value={false}>{i18n.t("common.no")}</MenuItem>
                    </Field>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6} md={2} item>
                  <FormControl
                    margin="dense"
                    variant="outlined"
                    fullWidth
                    className={classes.selectContainer}
                  >
                    <InputLabel htmlFor="campaigns-selection">
                      {i18n.t("companiesManager.form.campaigns")}
                    </InputLabel>
                    <Field
                      as={Select}
                      id="campaigns-selection"
                      label={i18n.t("companiesManager.form.campaigns")}
                      labelId="campaigns-selection-label"
                      name="campaignsEnabled"
                      margin="dense"
                    >
                      <MenuItem value={true}>
                        {i18n.t("common.enabled")}
                      </MenuItem>
                      <MenuItem value={false}>
                        {i18n.t("common.disabled")}
                      </MenuItem>
                    </Field>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6} md={2} item>
                  <FormControl
                    variant="outlined"
                    fullWidth
                    className={classes.selectContainer}
                  >
                    <Field
                      as={TextField}
                      label={i18n.t("common.dueDate")}
                      type="date"
                      name="dueDate"
                      InputLabelProps={{
                        shrink: true
                      }}
                      variant="outlined"
                      fullWidth
                      margin="dense"
                    />
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6} md={2} item>
                  <FormControl
                    margin="dense"
                    variant="outlined"
                    fullWidth
                    className={classes.selectContainer}
                  >
                    <InputLabel htmlFor="recorrencia-selection">
                      {i18n.t("companiesManager.form.recurrence")}
                    </InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("companiesManager.form.recurrence")}
                      labelId="recorrencia-selection-label"
                      id="recurrence"
                      name="recurrence"
                      margin="dense"
                    >
                      <MenuItem value="MENSAL">
                        {i18n.t("companiesManager.form.monthly")}
                      </MenuItem>
                      <MenuItem value="BIMESTRAL">
                        {i18n.t("companiesManager.form.bimonthly")}
                      </MenuItem>
                      <MenuItem value="TRIMESTRAL">
                        {i18n.t("companiesManager.form.quarterly")}
                      </MenuItem>
                      <MenuItem value="SEMESTRAL">
                        {i18n.t("companiesManager.form.semiannual")}
                      </MenuItem>
                      <MenuItem value="ANUAL">
                        {i18n.t("companiesManager.form.annual")}
                      </MenuItem>
                    </Field>
                  </FormControl>
                </Grid>
                <Grid xs={12} item>
                  <div className={classes.buttonRow}>
                    {record.id !== undefined ? (
                      <>
                        <ButtonWithSpinner
                          className={classes.outlinedButton}
                          loading={loading}
                          onClick={() => onCancel()}
                          variant="outlined"
                        >
                          {i18n.t("companiesManager.buttons.clear")}
                        </ButtonWithSpinner>
                        <ButtonWithSpinner
                          className={classes.outlinedButton}
                          loading={loading}
                          onClick={() => onImpersonate(record)}
                          variant="outlined"
                          color="primary"
                          startIcon={<VpnKeyOutlined />}
                        >
                          {i18n.t("companiesManager.buttons.accessAs")}
                        </ButtonWithSpinner>
                        <ButtonWithSpinner
                          className={classes.dangerButton}
                          loading={loading}
                          onClick={() => onDelete(record)}
                          variant="contained"
                          startIcon={<DeleteOutline />}
                        >
                          {i18n.t("common.delete")}
                        </ButtonWithSpinner>
                        <ButtonWithSpinner
                          className={classes.primaryButton}
                          loading={loading}
                          onClick={() => incrementDueDate()}
                          variant="contained"
                          color="primary"
                          startIcon={<EventOutlined />}
                        >
                          {i18n.t(
                            "companiesManager.buttons.incrementDueDate"
                          )}
                        </ButtonWithSpinner>
                        <ButtonWithSpinner
                          className={classes.secondaryButton}
                          loading={loading}
                          onClick={() => handleOpenModalUsers()}
                          variant="contained"
                          startIcon={<PersonOutline />}
                        >
                          {i18n.t("common.user")}
                        </ButtonWithSpinner>
                      </>
                    ) : (
                      <ButtonWithSpinner
                        className={classes.outlinedButton}
                        loading={loading}
                        onClick={() => onCancel()}
                        variant="outlined"
                      >
                        {i18n.t("companiesManager.buttons.clear")}
                      </ButtonWithSpinner>
                    )}
                    <ButtonWithSpinner
                      className={classes.primaryButton}
                      loading={loading}
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SaveOutlined />}
                    >
                      {i18n.t("common.save")}
                    </ButtonWithSpinner>
                  </div>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Box>
    </>
  );
}

export function CompaniesManagerGrid(props) {
  const { records, onSelect } = props;
  const classes = useStyles();
  const { dateToClient } = useDate();
  const { getSetting } = useSettings();
  const [gracePeriod, setGracePeriod] = useState(5);

  useEffect(() => {
    getSetting("gracePeriod").then(value => {
      if (!isNaN(Number(value))) {
        setGracePeriod(Number(value));
      }
    });
  }, [getSetting]);

  const renderStatus = row => {
    const isActive = row.status !== false;
    return (
      <Chip
        label={
          isActive
            ? i18n.t("common.yes")
            : i18n.t("common.no")
        }
        className={
          isActive ? classes.statusChipEnabled : classes.statusChipDisabled
        }
        size="small"
      />
    );
  };

  const renderPlan = row => {
    return row.planId !== null ? row.plan.name : i18n.t("common.undefined");
  };

  const renderCampaignsStatus = row => {
    let isEnabled = false;

    if (
      has(row, "settings") &&
      isArray(row.settings) &&
      row.settings.length > 0
    ) {
      const setting = row.settings.find(s => s.key === "campaignsEnabled");
      if (setting) {
        isEnabled = setting.value === "true";
      }
    }

    return (
      <Chip
        label={
          isEnabled
            ? i18n.t("common.enabled")
            : i18n.t("common.disabled")
        }
        className={
          isEnabled ? classes.statusChipEnabled : classes.statusChipDisabled
        }
        size="small"
      />
    );
  };

  const rowClass = record => {
    if (moment(record.dueDate).isValid()) {
      const now = moment();
      const dueDate = moment(record.dueDate);
      const diff = dueDate.diff(now, "days");
      if (diff < -gracePeriod) {
        return classes.inactive;
      }
      if (diff < 0) {
        return classes.gracePeriod;
      }
      if (diff < 7) {
        return classes.almostDue;
      }
    }
    return classes.active;
  };

  if (!records || records.length === 0) {
    return (
      <Paper className={classes.tableContainer} elevation={0}>
        <div className={classes.emptyState}>
          <BusinessOutlined className={classes.emptyStateIcon} />
          <Typography variant="h6" className={classes.emptyStateText}>
            Nenhuma empresa cadastrada ainda
          </Typography>
          <Typography
            variant="body2"
            style={{ color: "#94a3b8", marginTop: 8 }}
          >
            Preencha o formulário acima para cadastrar a primeira empresa.
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
            <TableCell align="left">{i18n.t("common.name")}</TableCell>
            <TableCell align="left">{i18n.t("common.email")}</TableCell>
            <TableCell align="left">{i18n.t("common.phone")}</TableCell>
            <TableCell align="left">{i18n.t("companies.form.plan")}</TableCell>
            <TableCell align="left">
              {i18n.t("companiesManager.table.campaigns")}
            </TableCell>
            <TableCell align="left">{i18n.t("common.status")}</TableCell>
            <TableCell align="left">
              {i18n.t("companiesManager.table.createdAt")}
            </TableCell>
            <TableCell align="left">{i18n.t("common.dueDate")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((row, key) => (
            <TableRow
              className={`${classes.tableRow} ${rowClass(row)}`}
              key={key}
            >
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
              <TableCell align="left" style={{ color: "unset", fontWeight: 600 }}>
                {row.name || "-"}
              </TableCell>
              <TableCell align="left" style={{ color: "unset" }}>
                {row.email || "-"}
              </TableCell>
              <TableCell align="left" style={{ color: "unset" }}>
                {row.phone || "-"}
              </TableCell>
              <TableCell align="left" style={{ color: "unset" }}>
                {renderPlan(row)}
              </TableCell>
              <TableCell align="left" style={{ color: "unset" }}>
                {renderCampaignsStatus(row)}
              </TableCell>
              <TableCell align="left" style={{ color: "unset" }}>
                {renderStatus(row)}
              </TableCell>
              <TableCell align="left" style={{ color: "unset" }}>
                {dateToClient(row.createdAt)}
              </TableCell>
              <TableCell align="left" style={{ color: "unset" }}>
                {dateToClient(row.dueDate)}
                {row.recurrence && (
                  <>
                    <br />
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "#94a3b8",
                        fontWeight: 600,
                        letterSpacing: "0.05em"
                      }}
                    >
                      {row.recurrence}
                    </span>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default function CompaniesManager() {
  const classes = useStyles();
  const { list, save, update, remove } = useCompanies();

  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [showConfirmImpersonateDialog, setShowConfirmImpersonateDialog] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState({
    name: "",
    email: "",
    phone: "",
    language: "",
    planId: "",
    status: true,
    campaignsEnabled: false,
    dueDate: "",
    recurrence: ""
  });

  const { handleImpersonate } = useContext(AuthContext);

  useEffect(() => {
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const companyList = await list();
      setRecords(companyList);
    } catch (e) {
      toast.error(i18n.t("companiesManager.toasts.loadError"));
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
      await loadPlans();
      handleCancel();
      toast.success(i18n.t("companiesManager.toasts.operationSuccess"));
    } catch (e) {
      toast.error(i18n.t("companiesManager.toasts.operationErrorDuplicate"));
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await remove(record.id);
      await loadPlans();
      handleCancel();
      toast.success(i18n.t("companiesManager.toasts.operationSuccess"));
    } catch (e) {
      toast.error(i18n.t("companiesManager.toasts.operationError"));
    }
    setLoading(false);
  };

  const onImpersonate = async () => {
    handleImpersonate(record.id);
  };

  const handleOpenDeleteDialog = () => {
    setShowConfirmDeleteDialog(true);
  };

  const handleOpenImpersonateDialog = () => {
    setShowConfirmImpersonateDialog(true);
  };

  const handleCancel = () => {
    setRecord(prev => ({
      ...prev,
      name: "",
      email: "",
      phone: "",
      language: "",
      planId: "",
      status: true,
      campaignsEnabled: false,
      dueDate: "",
      recurrence: ""
    }));
  };

  const handleSelect = data => {
    let campaignsEnabled = false;

    const setting = data.settings.find(
      s => s.key.indexOf("campaignsEnabled") > -1
    );
    if (setting) {
      campaignsEnabled =
        setting.value === "true" || setting.value === "enabled";
    }

    setRecord(prev => ({
      ...prev,
      id: data.id,
      name: data.name || "",
      phone: data.phone || "",
      language: data.language || "",
      email: data.email || "",
      planId: data.planId || "",
      status: data.status === false ? false : true,
      campaignsEnabled,
      dueDate: data.dueDate || "",
      recurrence: data.recurrence || ""
    }));
  };

  return (
    <Paper className={classes.mainPaper} elevation={0}>
      <Grid spacing={3} container>
        <Grid xs={12} item>
          <CompanyForm
            initialValue={record}
            onDelete={handleOpenDeleteDialog}
            onImpersonate={handleOpenImpersonateDialog}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </Grid>
        <Grid xs={12} item>
          <CompaniesManagerGrid records={records} onSelect={handleSelect} />
        </Grid>
      </Grid>
      <ConfirmationModal
        title={i18n.t("companiesManager.confirmationModal.deleteTitle")}
        open={showConfirmDeleteDialog}
        onClose={() => setShowConfirmDeleteDialog(false)}
        onConfirm={() => handleDelete()}
      >
        {i18n.t("companiesManager.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <ConfirmationModal
        title={i18n.t("companiesManager.confirmationModal.impersonateTitle")}
        open={showConfirmImpersonateDialog}
        onClose={() => setShowConfirmImpersonateDialog(false)}
        onConfirm={() => onImpersonate()}
      >
        {i18n.t("companiesManager.confirmationModal.impersonateMessage")}
      </ConfirmationModal>
    </Paper>
  );
}