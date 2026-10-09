import React, { useEffect, useState, useRef, useContext } from "react";

import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import useSettings from "../../hooks/useSettings";
import { i18nToast } from "../../helpers/i18nToast";
import { makeStyles } from "@material-ui/core/styles";
import OnlyForSuperUser from "../OnlyForSuperUser";
import useAuth from "../../hooks/useAuth.js";
import {
  Delete,
  TuneOutlined,
  TimerOutlined,
  ScheduleOutlined,
  GroupOutlined,
  LockOutlined,
  HttpOutlined,
  CloudOutlined,
  SupervisorAccountOutlined,
  RefreshOutlined,
  ExtensionOutlined,
  GetAppOutlined
} from "@material-ui/icons";
import { IconButton, TextField, Button, Typography, Box } from "@material-ui/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faGears } from "@fortawesome/free-solid-svg-icons";

import { generateSecureToken } from "../../helpers/generateSecureToken";
import { copyToClipboard } from "../../helpers/copyToClipboard";
import useQueues from "../../hooks/useQueues";
import { i18n } from "../../translate/i18n.js";
import { SelectLanguage } from "../SelectLanguage";
import { SocketContext } from "../../context/Socket/SocketContext";
import api from "../../services/api";
import { getBackendURL } from "../../services/config";

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  // Sub-card moderno
  sectionCard: {
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
  // Campos modernizados
  selectContainer: {
    width: "100%",
    textAlign: "left",
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
    },
    "& .MuiFormHelperText-root": {
      color: "#94a3b8",
      fontSize: "0.75rem",
      lineHeight: 1.5,
      marginLeft: 0,
      marginTop: theme.spacing(0.75)
    }
  },
  // Ícones de ação dos campos
  fieldAction: {
    color: "#64748b",
    padding: theme.spacing(0.75),
    borderRadius: "8px",
    transition: "all 0.2s ease",
    "& svg": {
      fontSize: "1.1rem"
    },
    "&:hover": {
      backgroundColor: "#eff6ff",
      color: "#3b82f6"
    }
  },
  deleteAction: {
    "&:hover": {
      backgroundColor: "#fef2f2",
      color: "#ef4444"
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
  // Helper text
  helperText: {
    fontSize: "0.75rem",
    color: "#94a3b8",
    marginTop: theme.spacing(1),
    lineHeight: 1.5
  },
  mustacheHint: {
    color: "#94a3b8",
    fontSize: "0.75rem",
    marginTop: theme.spacing(0.5),
    display: "block",
    fontFamily: "monospace"
  },
  buttonRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    flexWrap: "wrap",
    marginTop: theme.spacing(2)
  }
}));

// Helper para renderizar o cabeçalho da seção
const SectionHeader = ({ icon, title, description, classes }) => (
  <>
    <Box className={classes.sectionHeader}>
      {icon}
      <Typography className={classes.sectionTitle}>{title}</Typography>
    </Box>
    {description && (
      <Typography className={classes.sectionDescription}>
        {description}
      </Typography>
    )}
  </>
);

export default function Options(props) {
  const { settings, scheduleTypeChanged } = props;
  const classes = useStyles();
  const [userRating, setUserRating] = useState("disabled");
  const [scheduleType, setScheduleType] = useState("disabled");
  const [outOfHoursAction, setOutOfHoursAction] = useState("pending");
  const [callType, setCallType] = useState("enabled");
  const [quickMessages, setQuickMessages] = useState("");
  const [defaultLanguage, setDefaultLanguage] = useState("");
  const [allowSignup, setAllowSignup] = useState("disabled");
  const [chatbotAutoExit, setChatbotAutoExit] = useState("disabled");
  const [showNumericIcons, setShowNumericIcons] = useState("disabled");
  const [CheckMsgIsGroup, setCheckMsgIsGroupType] = useState("enabled");
  const [soundGroupNotifications, setSoundGroupNotifications] =
    useState("disabled");
  const [groupsTab, setGroupsTab] = useState("disabled");
  const [apiToken, setApiToken] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
  const [aiProvider, setAiProvider] = useState("openai");
  const [audioTranscriptions, setAudioTranscriptions] = useState("disabled");
  const [useMultiThreadedWbot, setUseMultiThreadedWbot] = useState("disabled");
  const [uploadLimit, setUploadLimit] = useState("15");
  const [downloadLimit, setDownloadLimit] = useState("15");

  const [messageVisibility, setMessageVisibility] = useState("message");

  const [noQueueTimeout, setNoQueueTimeout] = useState("0");
  const [noQueueTimeoutAction, setNoQueueTimeoutAction] = useState("0");
  const [openTicketTimeout, setOpenTicketTimeout] = useState("0");
  const [openTicketTimeoutAction, setOpenTicketTimeoutAction] =
    useState("pending");
  const [chatbotTicketTimeout, setChatbotTicketTimeout] = useState("0");
  const [chatbotTicketTimeoutAction, setChatbotTicketTimeoutAction] =
    useState(0);

  const [queues, setQueues] = useState([]);
  const { findAll: findAllQueues } = useQueues();

  const [keepUserAndQueue, setKeepUserAndQueue] = useState("enabled");
  const [ratingsTimeout, setRatingsTimeout] = useState(false);
  const [autoReopenTimeout, setAutoReopenTimeout] = useState(false);
  const [gracePeriod, setGracePeriod] = useState(0);
  const [tagsMode, setTagsMode] = useState("ticket");
  const [ticketAcceptedMessage, setTicketAcceptedMessage] = useState("");
  const [transferMessage, setTransferMessage] = useState("");

  const { getCurrentUserInfo } = useAuth();
  const [currentUser, setCurrentUser] = useState({});

  const downloadLimitInput = useRef(null);

  const { update } = useSettings();

  const [extensionUrl, setExtensionUrl] = useState("");
  const [buildingExtension, setBuildingExtension] = useState(false);

  const socketManager = useContext(SocketContext);

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (!companyId) return;

    const socket = socketManager.GetSocket(companyId);

    const onExtensionBuild = data => {
      setBuildingExtension(false);
      if (data?.status === "success" && data?.url) {
        setExtensionUrl(data.url);
        i18nToast.success("whitelabel.extensionBuilt");
      } else {
        i18nToast.error(
          data?.message || i18n.t("whitelabel.extensionBuildUnknownError")
        );
      }
    };

    socket.on(`company-${companyId}-extensionBuild`, onExtensionBuild);

    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  useEffect(() => {
    getCurrentUserInfo().then(u => {
      setCurrentUser(u);
    });

    if (Array.isArray(settings) && settings.length) {
      const userRating = settings.find(s => s.key === "userRating");
      if (userRating) {
        setUserRating(userRating.value);
      }
      const scheduleType = settings.find(s => s.key === "scheduleType");
      if (scheduleType) {
        setScheduleType(scheduleType.value);
      }

      const outOfHoursAction = settings.find(s => s.key === "outOfHoursAction");
      setOutOfHoursAction(outOfHoursAction?.value || "pending");

      const callType = settings.find(s => s.key === "call");
      if (callType) {
        setCallType(callType.value);
      }
      const CheckMsgIsGroup = settings.find(s => s.key === "CheckMsgIsGroup");
      if (CheckMsgIsGroup) {
        setCheckMsgIsGroupType(CheckMsgIsGroup.value);
      }

      const soundGroupNotifications = settings.find(
        s => s.key === "soundGroupNotifications"
      );
      setSoundGroupNotifications(soundGroupNotifications?.value || "disabled");

      const groupsTab = settings.find(s => s.key === "groupsTab");
      setGroupsTab(groupsTab?.value || "disabled");

      const chatbotAutoExit = settings.find(s => s.key === "chatbotAutoExit");
      if (chatbotAutoExit) {
        setChatbotAutoExit(chatbotAutoExit.value);
      }

      const showNumericIcons = settings.find(s => s.key === "showNumericIcons");
      setShowNumericIcons(showNumericIcons?.value || "disabled");

      const defaultLanguage = settings.find(s => s.key === "defaultLanguage");
      setDefaultLanguage(defaultLanguage?.value);

      const allowSignup = settings.find(s => s.key === "allowSignup");
      if (allowSignup) {
        setAllowSignup(allowSignup.value);
      }
      const quickMessages = settings.find(s => s.key === "quickMessages");
      setQuickMessages(quickMessages?.value || "individual");

      const keepUserAndQueue = settings.find(s => s.key === "keepUserAndQueue");
      setKeepUserAndQueue(keepUserAndQueue?.value || "enabled");

      const apiToken = settings.find(s => s.key === "apiToken");
      setApiToken(apiToken?.value || "");

      const openAiKey = settings.find(s => s.key === "openAiKey");
      setOpenAiKey(openAiKey?.value || "");

      const aiProvider = settings.find(s => s.key === "aiProvider");
      setAiProvider(aiProvider?.value || "openai");

      const audioTranscriptions = settings.find(
        s => s.key === "audioTranscriptions"
      );
      setAudioTranscriptions(audioTranscriptions?.value || "disabled");

      const useMultiThreadedWbot = settings.find(
        s => s.key === "useMultiThreadedWbot"
      );
      setUseMultiThreadedWbot(useMultiThreadedWbot?.value || "disabled");

      const uploadLimit = settings.find(s => s.key === "uploadLimit");
      setUploadLimit(uploadLimit?.value || "");

      const downloadLimit = settings.find(s => s.key === "downloadLimit");
      setDownloadLimit(downloadLimit?.value || "");

      const messageVisibility = settings.find(
        s => s.key === "messageVisibility"
      );
      setMessageVisibility(messageVisibility?.value || "message");

      const ratingsTimeout = settings.find(s => s.key === "ratingsTimeout");
      setRatingsTimeout(ratingsTimeout?.value || "5");

      const autoReopenTimeout = settings.find(
        s => s.key === "autoReopenTimeout"
      );
      setAutoReopenTimeout(autoReopenTimeout?.value || "0");

      const noQueueTimeout = settings.find(s => s.key === "noQueueTimeout");
      setNoQueueTimeout(noQueueTimeout?.value || "0");

      const noQueueTimeoutAction = settings.find(
        s => s.key === "noQueueTimeoutAction"
      );
      setNoQueueTimeoutAction(noQueueTimeoutAction?.value || "0");

      const openTicketTimeout = settings.find(
        s => s.key === "openTicketTimeout"
      );
      setOpenTicketTimeout(openTicketTimeout?.value || "0");

      const openTicketTimeoutAction = settings.find(
        s => s.key === "openTicketTimeoutAction"
      );
      setOpenTicketTimeoutAction(openTicketTimeoutAction?.value || "pending");

      const chatbotTicketTimeout = settings.find(
        s => s.key === "chatbotTicketTimeout"
      );
      setChatbotTicketTimeout(chatbotTicketTimeout?.value || "0");

      const chatbotTicketTimeoutAction = settings.find(
        s => s.key === "chatbotTicketTimeoutAction"
      );
      setChatbotTicketTimeoutAction(chatbotTicketTimeoutAction?.value || "0");

      const gracePeriod = settings.find(s => s.key === "gracePeriod");
      setGracePeriod(gracePeriod?.value || 0);

      const tagsMode = settings.find(s => s.key === "tagsMode");
      setTagsMode(tagsMode?.value || "ticket");

      const ticketAcceptedMessage = settings.find(
        s => s.key === "ticketAcceptedMessage"
      );
      setTicketAcceptedMessage(ticketAcceptedMessage?.value || "");

      const transferMessage = settings.find(s => s.key === "transferMessage");
      setTransferMessage(transferMessage?.value || "");

      const extensionDownloadUrl = settings.find(
        s => s.key === "extensionDownloadUrl"
      );
      setExtensionUrl(extensionDownloadUrl?.value || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  useEffect(() => {
    if (isMounted.current) {
      const loadQueues = async () => {
        const list = await findAllQueues();
        setQueues(list);
      };
      loadQueues();
    }
  }, []);

  async function handleChangeUserRating(value) {
    setUserRating(value);
    await update({ key: "userRating", value });
    i18nToast.success("settings.success");
  }

  async function handleScheduleType(value) {
    setScheduleType(value);
    await update({ key: "scheduleType", value });
    i18nToast.success("settings.success");
    if (typeof scheduleTypeChanged === "function") {
      scheduleTypeChanged(value);
    }
  }

  async function handleCallType(value) {
    setCallType(value);
    await update({ key: "call", value });
    i18nToast.success("settings.success");
  }

  async function handleChatbotAutoExit(value) {
    setChatbotAutoExit(value);
    await update({ key: "chatbotAutoExit", value });
    i18nToast.success("settings.success");
  }

  async function handleQuickMessages(value) {
    setQuickMessages(value);
    await update({ key: "quickMessages", value });
    i18nToast.success("settings.success");
  }

  async function handleAllowSignup(value) {
    setAllowSignup(value);
    await update({ key: "allowSignup", value });
    i18nToast.success("settings.success");
  }

  async function handleDownloadLimit(value) {
    setDownloadLimit(value);
    await update({ key: "downloadLimit", value });
    i18nToast.success("settings.success");
  }

  async function handleRatingsTimeout(value) {
    setRatingsTimeout(value);
    await update({ key: "ratingsTimeout", value });
    i18nToast.success("settings.success");
  }

  async function handleAutoReopenTimeout(value) {
    setAutoReopenTimeout(value);
    await update({ key: "autoReopenTimeout", value });
    i18nToast.success("settings.success");
  }

  async function handleSetting(key, value, setter = null) {
    if (setter) {
      setter(value);
    }
    await update({ key, value });
    i18nToast.success("settings.success");
  }

  const [restartingBackend, setRestartingBackend] = useState(false);

  const handleBuildExtension = async () => {
    setBuildingExtension(true);
    try {
      await api.post("/build-capture-extension");
      i18nToast.success("whitelabel.extensionBuildStarted");
    } catch (error) {
      setBuildingExtension(false);
      i18nToast.error("whitelabel.extensionBuildFailed");
    }
  };

  const handleRestartBackend = async () => {
    setRestartingBackend(true);
    try {
      await api.post("/restart");
      window.location.href = "/?restart=1";
    } catch (error) {
      setRestartingBackend(false);
      i18nToast.error("settings.restartBackend.error");
    }
  };

  async function generateApiToken() {
    const newToken = generateSecureToken(33);
    setApiToken(newToken);
    await update({ key: "apiToken", value: newToken });
    i18nToast.success("settings.success");
  }

  async function deleteApiToken() {
    setApiToken("");
    await update({ key: "apiToken", value: "" });
    i18nToast.success("settings.success");
  }

  async function copyApiToken() {
    copyToClipboard(apiToken);
    i18nToast.success("settings.copiedToClipboard");
  }

  async function handleGroupType(value) {
    setCheckMsgIsGroupType(value);
    await update({ key: "CheckMsgIsGroup", value });
    i18nToast.success("settings.success");
  }

  return (
    <>
      <Grid spacing={2} container>
        {/* SEÇÃO: Geral */}
        <Grid item xs={12}>
          <Box className={classes.sectionCard}>
            <SectionHeader
              icon={<TuneOutlined />}
              title={i18n.t("settings.group.general")}
              description="Configurações gerais de comportamento do sistema."
              classes={classes}
            />
            <Grid spacing={2} container>
              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="ratings-label">
                    {i18n.t("settings.validations.title")}
                  </InputLabel>
                  <Select
                    labelId="ratings-label"
                    label={i18n.t("settings.validations.title")}
                    value={userRating}
                    onChange={async e => {
                      handleChangeUserRating(e.target.value);
                    }}
                  >
                    <MenuItem value={"disabled"}>
                      {i18n.t("settings.validations.options.disabled")}
                    </MenuItem>
                    <MenuItem value={"enabled"}>
                      {i18n.t("settings.validations.options.enabled")}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="call-type-label">
                    {i18n.t("settings.VoiceAndVideoCalls.title")}
                  </InputLabel>
                  <Select
                    labelId="call-type-label"
                    label={i18n.t("settings.VoiceAndVideoCalls.title")}
                    value={callType}
                    onChange={async e => {
                      handleCallType(e.target.value);
                    }}
                  >
                    <MenuItem value={"disabled"}>
                      {i18n.t("settings.VoiceAndVideoCalls.options.disabled")}
                    </MenuItem>
                    <MenuItem value={"enabled"}>
                      {i18n.t("settings.VoiceAndVideoCalls.options.enabled")}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="chatbot-autoexit-label">
                    {i18n.t("settings.AutomaticChatbotOutput.title")}
                  </InputLabel>
                  <Select
                    labelId="chatbot-autoexit-label"
                    label={i18n.t("settings.AutomaticChatbotOutput.title")}
                    value={chatbotAutoExit}
                    onChange={async e => {
                      handleChatbotAutoExit(e.target.value);
                    }}
                  >
                    <MenuItem value={"disabled"}>
                      {i18n.t(
                        "settings.AutomaticChatbotOutput.options.disabled"
                      )}
                    </MenuItem>
                    <MenuItem value={"enabled"}>
                      {i18n.t(
                        "settings.AutomaticChatbotOutput.options.enabled"
                      )}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="quickmessages-label">
                    {i18n.t("settings.QuickMessages.title")}
                  </InputLabel>
                  <Select
                    labelId="quickmessages-label"
                    label={i18n.t("settings.QuickMessages.title")}
                    value={quickMessages}
                    onChange={async e => {
                      handleQuickMessages(e.target.value);
                    }}
                  >
                    <MenuItem value={"company"}>
                      {i18n.t("settings.QuickMessages.options.enabled")}
                    </MenuItem>
                    <MenuItem value={"individual"}>
                      {i18n.t("settings.QuickMessages.options.disabled")}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="tags-mode-label">
                    {i18n.t("settings.TagsMode.title")}
                  </InputLabel>
                  <Select
                    labelId="tags-mode-label"
                    label={i18n.t("settings.TagsMode.title")}
                    value={tagsMode}
                    onChange={async e => {
                      handleSetting("tagsMode", e.target.value, setTagsMode);
                    }}
                  >
                    <MenuItem value={"ticket"}>
                      {i18n.t("settings.TagsMode.options.ticket")}
                    </MenuItem>
                    <MenuItem value={"contact"}>
                      {i18n.t("settings.TagsMode.options.contact")}
                    </MenuItem>
                    <MenuItem value={"both"}>
                      {i18n.t("settings.TagsMode.options.both")}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="shownumericicons-label">
                    {i18n.t("settings.ShowNumericEmoticons.title")}
                  </InputLabel>
                  <Select
                    labelId="shownumericicons-label"
                    label={i18n.t("settings.ShowNumericEmoticons.title")}
                    value={showNumericIcons}
                    onChange={async e => {
                      handleSetting(
                        "showNumericIcons",
                        e.target.value,
                        setShowNumericIcons
                      );
                    }}
                  >
                    <MenuItem value={"disabled"}>
                      {i18n.t("common.disabled")}
                    </MenuItem>
                    <MenuItem value={"enabled"}>
                      {i18n.t("common.enabled")}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} md={6} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    variant="outlined"
                    id="ticket-accepted-message-field"
                    label={i18n.t("settings.ticketAcceptedMessage.title")}
                    placeholder={i18n.t(
                      "settings.ticketAcceptedMessage.placeholder"
                    )}
                    multiline
                    rows={4}
                    value={ticketAcceptedMessage}
                    onChange={e => {
                      setTicketAcceptedMessage(e.target.value);
                    }}
                    onBlur={e => {
                      handleSetting(
                        "ticketAcceptedMessage",
                        ticketAcceptedMessage
                      );
                    }}
                  />
                  <span className={classes.mustacheHint}>
                    {i18n.t("settings.mustacheVariables.title")}{" "}
                    {"{{firstname}} {{name}} {{user}} {{queue}}"}
                  </span>
                </FormControl>
              </Grid>

              <Grid xs={12} md={6} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    variant="outlined"
                    id="transfer-message-field"
                    label={i18n.t("settings.transferMessage.title")}
                    placeholder={i18n.t("settings.transferMessage.placeholder")}
                    multiline
                    rows={4}
                    value={transferMessage}
                    onChange={e => {
                      setTransferMessage(e.target.value);
                    }}
                    onBlur={e => {
                      handleSetting("transferMessage", transferMessage);
                    }}
                  />
                  <span className={classes.mustacheHint}>
                    {i18n.t("settings.mustacheVariables.title")}{" "}
                    {"{{firstname}} {{name}} {{user}} {{queue}}"}
                  </span>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* SEÇÃO: Timeouts */}
        <Grid item xs={12}>
          <Box className={classes.sectionCard}>
            <SectionHeader
              icon={<TimerOutlined />}
              title={i18n.t("settings.group.timeouts")}
              description="Defina tempos limite para ações automáticas dos tickets."
              classes={classes}
            />
            <Grid spacing={2} container>
              <Grid xs={12} sm={6} md={4} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    variant="outlined"
                    id="ratings-timeout-field"
                    label="Timeout para avaliação (minutos)"
                    name="ratingsTimeout"
                    type="number"
                    value={ratingsTimeout}
                    onChange={e => {
                      setRatingsTimeout(e.target.value);
                    }}
                    onBlur={async _ => {
                      await handleRatingsTimeout(ratingsTimeout);
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    variant="outlined"
                    id="autoreopen-timeout-field"
                    label="Timeout para reabertura automática (minutos)"
                    name="autoReopenTimeout"
                    type="number"
                    value={autoReopenTimeout}
                    onChange={e => {
                      setAutoReopenTimeout(e.target.value);
                    }}
                    onBlur={async _ => {
                      await handleAutoReopenTimeout(autoReopenTimeout);
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    variant="outlined"
                    id="noqueue-timeout-field"
                    label="Timeout para ticket sem fila (minutos)"
                    name="noQueueTimeout"
                    type="number"
                    value={noQueueTimeout}
                    onChange={e => {
                      setNoQueueTimeout(e.target.value);
                    }}
                    onBlur={async _ => {
                      await handleSetting("noQueueTimeout", noQueueTimeout);
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="noqueue-timeout-action-label">
                    Ação para timeout de ticket sem fila
                  </InputLabel>
                  <Select
                    labelId="noqueue-timeout-action-label"
                    label="Ação para timeout de ticket sem fila"
                    value={noQueueTimeoutAction}
                    onChange={async e => {
                      handleSetting(
                        "noQueueTimeoutAction",
                        e.target.value,
                        setNoQueueTimeoutAction
                      );
                    }}
                  >
                    <MenuItem value={"0"}>Fechar</MenuItem>
                    {queues.map(queue => (
                      <MenuItem key={queue.id} value={queue.id}>
                        Transferir para {queue.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    variant="outlined"
                    id="openticket-timeout-field"
                    label="Timeout para ticket em atendimento (minutos)"
                    name="openTicketTimeout"
                    type="number"
                    value={openTicketTimeout}
                    onChange={e => {
                      setOpenTicketTimeout(e.target.value);
                    }}
                    onBlur={async _ => {
                      await handleSetting(
                        "openTicketTimeout",
                        openTicketTimeout
                      );
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="opentimeout-action-label">
                    Ação para timeout de ticket aberto
                  </InputLabel>
                  <Select
                    labelId="opentimeout-action-label"
                    label="Ação para timeout de ticket aberto"
                    value={openTicketTimeoutAction}
                    onChange={async e => {
                      handleSetting(
                        "openTicketTimeoutAction",
                        e.target.value,
                        setOpenTicketTimeoutAction
                      );
                    }}
                  >
                    <MenuItem value={"pending"}>Retornar para a fila</MenuItem>
                    <MenuItem value={"closed"}>Fechar atendimento</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    variant="outlined"
                    id="chatbot-timeout-field"
                    label={i18n.t("settings.chatbotTicketTimeout")}
                    name="chatbotTicketTimeout"
                    type="number"
                    value={chatbotTicketTimeout}
                    onChange={e => {
                      setChatbotTicketTimeout(e.target.value);
                    }}
                    onBlur={async _ => {
                      await handleSetting(
                        "chatbotTicketTimeout",
                        chatbotTicketTimeout
                      );
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="chatbot-ticket-timeout-action-label">
                    {i18n.t("settings.chatbotTicketTimeoutAction")}
                  </InputLabel>
                  <Select
                    labelId="chatbot-ticket-timeout-action-label"
                    label={i18n.t("settings.chatbotTicketTimeoutAction")}
                    value={chatbotTicketTimeoutAction}
                    onChange={async e => {
                      handleSetting(
                        "chatbotTicketTimeoutAction",
                        e.target.value,
                        setChatbotTicketTimeoutAction
                      );
                    }}
                  >
                    <MenuItem value={"0"}>{i18n.t("common.close")}</MenuItem>
                    {queues.map(queue => (
                      <MenuItem key={queue.id} value={queue.id}>
                        {i18n.t("common.transferTo")} {queue.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* SEÇÃO: Horário de Expediente */}
        <Grid item xs={12}>
          <Box className={classes.sectionCard}>
            <SectionHeader
              icon={<ScheduleOutlined />}
              title={i18n.t("settings.group.officeHours")}
              description="Configure o horário de funcionamento e ações fora do expediente."
              classes={classes}
            />
            <Grid spacing={2} container>
              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="schedule-type-label">
                    {i18n.t("settings.OfficeManagement.title")}
                  </InputLabel>
                  <Select
                    labelId="schedule-type-label"
                    label={i18n.t("settings.OfficeManagement.title")}
                    value={scheduleType}
                    onChange={async e => {
                      handleScheduleType(e.target.value);
                    }}
                  >
                    <MenuItem value={"disabled"}>
                      {i18n.t("settings.OfficeManagement.options.disabled")}
                    </MenuItem>
                    <MenuItem value={"queue"}>
                      {i18n.t(
                        "settings.OfficeManagement.options.ManagementByDepartment"
                      )}
                    </MenuItem>
                    <MenuItem value={"company"}>
                      {i18n.t(
                        "settings.OfficeManagement.options.ManagementByCompany"
                      )}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="out-of-hours-action-label">
                    {i18n.t("settings.outOfHoursAction.title")}
                  </InputLabel>
                  <Select
                    labelId="out-of-hours-action-label"
                    label={i18n.t("settings.outOfHoursAction.title")}
                    value={outOfHoursAction}
                    onChange={async e => {
                      await handleSetting(
                        "outOfHoursAction",
                        e.target.value,
                        setOutOfHoursAction
                      );
                    }}
                  >
                    <MenuItem value={"pending"}>
                      {i18n.t("settings.outOfHoursAction.options.pending")}
                    </MenuItem>
                    <MenuItem value={"closed"}>
                      {i18n.t("settings.outOfHoursAction.options.closed")}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* SEÇÃO: Grupos */}
        <Grid item xs={12}>
          <Box className={classes.sectionCard}>
            <SectionHeader
              icon={<GroupOutlined />}
              title={i18n.t("settings.group.groups")}
              description="Comportamento do sistema em relação a grupos do WhatsApp."
              classes={classes}
            />
            <Grid spacing={2} container>
              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="group-type-label">
                    {i18n.t("settings.IgnoreGroupMessages.title")}
                  </InputLabel>
                  <Select
                    labelId="group-type-label"
                    label={i18n.t("settings.IgnoreGroupMessages.title")}
                    value={CheckMsgIsGroup}
                    onChange={async e => {
                      handleGroupType(e.target.value);
                    }}
                  >
                    <MenuItem value={"disabled"}>
                      {i18n.t("settings.IgnoreGroupMessages.options.disabled")}
                    </MenuItem>
                    <MenuItem value={"enabled"}>
                      {i18n.t("settings.IgnoreGroupMessages.options.enabled")}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="sound-group-notifications-label">
                    {i18n.t("settings.soundGroupNotifications.title")}
                  </InputLabel>
                  <Select
                    labelId="sound-group-notifications-label"
                    label={i18n.t("settings.soundGroupNotifications.title")}
                    value={soundGroupNotifications}
                    onChange={async e => {
                      await handleSetting(
                        "soundGroupNotifications",
                        e.target.value,
                        setSoundGroupNotifications
                      );
                    }}
                  >
                    <MenuItem value={"disabled"}>
                      {i18n.t(
                        "settings.soundGroupNotifications.options.disabled"
                      )}
                    </MenuItem>
                    <MenuItem value={"enabled"}>
                      {i18n.t(
                        "settings.soundGroupNotifications.options.enabled"
                      )}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="groups-tab-label">
                    {i18n.t("settings.groupsTab.title")}
                  </InputLabel>
                  <Select
                    labelId="groups-tab-label"
                    label={i18n.t("settings.groupsTab.title")}
                    value={groupsTab}
                    disabled={CheckMsgIsGroup === "enabled"}
                    onChange={async e => {
                      await handleSetting(
                        "groupsTab",
                        e.target.value,
                        setGroupsTab
                      );
                    }}
                  >
                    <MenuItem value={"enabled"}>
                      {i18n.t("settings.groupsTab.options.enabled")}
                    </MenuItem>
                    <MenuItem value={"disabled"}>
                      {i18n.t("settings.groupsTab.options.disabled")}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* SEÇÃO: Confidencialidade */}
        <Grid item xs={12}>
          <Box className={classes.sectionCard}>
            <SectionHeader
              icon={<LockOutlined />}
              title={i18n.t("settings.group.confidenciality")}
              description="Controle de visibilidade de mensagens e filas."
              classes={classes}
            />
            <Grid spacing={2} container>
              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="message-visibility-label">
                    {i18n.t("settings.messageVisibility.title")}
                  </InputLabel>
                  <Select
                    labelId="message-visibility-label"
                    label={i18n.t("settings.messageVisibility.title")}
                    value={messageVisibility}
                    onChange={async e => {
                      await handleSetting(
                        "messageVisibility",
                        e.target.value,
                        setMessageVisibility
                      );
                    }}
                  >
                    <MenuItem value={"message"}>
                      {i18n.t(
                        "settings.messageVisibility.options.respectMessageQueue"
                      )}
                    </MenuItem>
                    <MenuItem value={"ticket"}>
                      {i18n.t(
                        "settings.messageVisibility.options.respectTicketQueue"
                      )}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="keep-queue-and-user-label">
                    {i18n.t("settings.keepQueueAndUser.title")}
                  </InputLabel>
                  <Select
                    labelId="keep-queue-and-user-label"
                    label={i18n.t("settings.keepQueueAndUser.title")}
                    value={keepUserAndQueue}
                    onChange={async e => {
                      await handleSetting(
                        "keepUserAndQueue",
                        e.target.value,
                        setKeepUserAndQueue
                      );
                    }}
                  >
                    <MenuItem value={"enabled"}>
                      {i18n.t("settings.keepQueueAndUser.options.enabled")}
                    </MenuItem>
                    <MenuItem value={"disabled"}>
                      {i18n.t("settings.keepQueueAndUser.options.disabled")}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* SEÇÃO: API */}
        <Grid item xs={12}>
          <Box className={classes.sectionCard}>
            <SectionHeader
              icon={<HttpOutlined />}
              title={i18n.t("settings.group.api")}
              description="Token de autenticação para integrações externas."
              classes={classes}
            />
            <Grid spacing={2} container>
              <Grid xs={12} sm={6} md={4} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    variant="outlined"
                    id="api-token-field"
                    label="API Token"
                    value={apiToken}
                    InputProps={{
                      endAdornment: (
                        <>
                          {apiToken && (
                            <>
                              <IconButton
                                size="small"
                                className={classes.fieldAction}
                                onClick={copyApiToken}
                              >
                                <FontAwesomeIcon icon={faCopy} />
                              </IconButton>
                              <IconButton
                                size="small"
                                className={`${classes.fieldAction} ${classes.deleteAction}`}
                                onClick={deleteApiToken}
                              >
                                <Delete />
                              </IconButton>
                            </>
                          )}
                          {!apiToken && (
                            <IconButton
                              size="small"
                              className={classes.fieldAction}
                              onClick={generateApiToken}
                            >
                              <FontAwesomeIcon icon={faGears} />
                            </IconButton>
                          )}
                        </>
                      )
                    }}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* SEÇÃO: Serviços Externos */}
        <Grid item xs={12}>
          <Box className={classes.sectionCard}>
            <SectionHeader
              icon={<CloudOutlined />}
              title={i18n.t("settings.group.externalServices")}
              description="Integração com serviços de IA e transcrição de áudio."
              classes={classes}
            />
            <Grid spacing={2} container>
              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="ai-provider-label">
                    {i18n.t("settings.AIProvider.title")}
                  </InputLabel>
                  <Select
                    labelId="ai-provider-label"
                    label={i18n.t("settings.AIProvider.title")}
                    value={aiProvider}
                    onChange={async e => {
                      handleSetting(
                        "aiProvider",
                        e.target.value,
                        setAiProvider
                      );
                    }}
                  >
                    <MenuItem value="openai">OpenAI</MenuItem>
                    <MenuItem value="groq">Groq</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={8} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    variant="outlined"
                    id="openai-key-field"
                    label="AI Key"
                    value={openAiKey}
                    onChange={e => {
                      setOpenAiKey(e.target.value);
                    }}
                    onBlur={async _ => {
                      await handleSetting("openAiKey", openAiKey);
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.selectContainer}
                >
                  <InputLabel id="audio-transcriptions-label">
                    {i18n.t("settings.AudioTranscriptions.title")}
                  </InputLabel>
                  <Select
                    labelId="audio-transcriptions-label"
                    label={i18n.t("settings.AudioTranscriptions.title")}
                    value={audioTranscriptions}
                    onChange={async e => {
                      handleSetting(
                        "audioTranscriptions",
                        e.target.value,
                        setAudioTranscriptions
                      );
                    }}
                  >
                    <MenuItem value="disabled">
                      {i18n.t("common.disabled")}
                    </MenuItem>
                    <MenuItem value="enabled">
                      {i18n.t("common.enabled")}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* SEÇÃO: Administração do Servidor (Super User) */}
        <OnlyForSuperUser
          user={currentUser}
          yes={() => (
            <Grid item xs={12}>
              <Box className={classes.sectionCard}>
                <SectionHeader
                  icon={<SupervisorAccountOutlined />}
                  title={i18n.t("settings.group.serveradmin")}
                  description="Configurações avançadas disponíveis apenas para super usuários."
                  classes={classes}
                />
                <Grid spacing={2} container>
                  <Grid xs={12} sm={6} md={4} item>
                    <SelectLanguage
                      className={classes.selectContainer}
                      fullWidth
                      value={defaultLanguage}
                      onChange={async e => {
                        handleSetting(
                          "defaultLanguage",
                          e.target.value,
                          setDefaultLanguage
                        );
                      }}
                    />
                  </Grid>

                  <Grid xs={12} sm={6} md={4} item>
                    <FormControl
                      variant="outlined"
                      className={classes.selectContainer}
                    >
                      <InputLabel id="allow-signup-label">
                        {i18n.t("settings.AllowRegistration.title")}
                      </InputLabel>
                      <Select
                        labelId="allow-signup-label"
                        label={i18n.t("settings.AllowRegistration.title")}
                        value={allowSignup}
                        onChange={async e => {
                          handleAllowSignup(e.target.value);
                        }}
                      >
                        <MenuItem value={"disabled"}>
                          {i18n.t(
                            "settings.AllowRegistration.options.disabled"
                          )}
                        </MenuItem>
                        <MenuItem value={"enabled"}>
                          {i18n.t(
                            "settings.AllowRegistration.options.enabled"
                          )}
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid xs={12} sm={6} md={4} item>
                    <FormControl
                      variant="outlined"
                      className={classes.selectContainer}
                    >
                      <InputLabel id="multithread-label">
                        {i18n.t("settings.MultiThreadedWbot.title")}
                      </InputLabel>
                      <Select
                        labelId="multithread-label"
                        label={i18n.t("settings.MultiThreadedWbot.title")}
                        value={useMultiThreadedWbot}
                        onChange={async e => {
                          handleSetting(
                            "useMultiThreadedWbot",
                            e.target.value,
                            setUseMultiThreadedWbot
                          );
                        }}
                      >
                        <MenuItem value={"disabled"}>
                          {i18n.t(
                            "settings.MultiThreadedWbot.options.disabled"
                          )}
                        </MenuItem>
                        <MenuItem value={"enabled"}>
                          {i18n.t(
                            "settings.MultiThreadedWbot.options.enabled"
                          )}
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid xs={12} sm={6} md={4} item>
                    <FormControl className={classes.selectContainer}>
                      <TextField
                        variant="outlined"
                        id="upload-limit-field"
                        label={i18n.t("settings.FileUploadLimit.title")}
                        name="uploadLimit"
                        value={uploadLimit}
                        onChange={e => {
                          setUploadLimit(e.target.value);
                        }}
                        onBlur={async _ => {
                          await handleSetting("uploadLimit", uploadLimit);
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid xs={12} sm={6} md={4} item>
                    <FormControl className={classes.selectContainer}>
                      <TextField
                        variant="outlined"
                        id="download-limit-field"
                        label={i18n.t("settings.FileDownloadLimit.title")}
                        name="downloadLimit"
                        value={downloadLimit}
                        inputRef={downloadLimitInput}
                        onChange={e => {
                          setDownloadLimit(e.target.value);
                        }}
                        onBlur={async _ => {
                          await handleDownloadLimit(downloadLimit);
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid xs={12} sm={6} md={4} item>
                    <FormControl className={classes.selectContainer}>
                      <TextField
                        variant="outlined"
                        id="grace-period-field"
                        label={i18n.t("settings.GracePeriod.title")}
                        name="gracePeriod"
                        type="number"
                        value={gracePeriod}
                        onChange={e => {
                          setGracePeriod(e.target.value);
                        }}
                        onBlur={async _ => {
                          await handleSetting("gracePeriod", gracePeriod);
                        }}
                      />
                    </FormControl>
                  </Grid>

                  {/* Botões de Ação - Extensão */}
                  <Grid xs={12} item>
                    <div className={classes.buttonRow}>
                      <Button
                        variant="contained"
                        color="primary"
                        className={classes.primaryButton}
                        disabled={buildingExtension}
                        onClick={handleBuildExtension}
                        startIcon={<ExtensionOutlined />}
                      >
                        {buildingExtension
                          ? i18n.t("whitelabel.buildingExtension")
                          : i18n.t("whitelabel.buildExtension")}
                      </Button>
                      {extensionUrl && (
                        <Button
                          variant="outlined"
                          className={classes.outlinedButton}
                          href={`${getBackendURL()}/public/${extensionUrl}?_=${Date.now()}`}
                          target="_blank"
                          rel="noopener"
                          startIcon={<GetAppOutlined />}
                        >
                          {i18n.t("whitelabel.downloadExtension")}
                        </Button>
                      )}
                    </div>
                    <Typography className={classes.helperText}>
                      {i18n.t("whitelabel.extensionHint")}
                    </Typography>
                  </Grid>

                  {/* Botão de Reiniciar Backend */}
                  <Grid xs={12} item>
                    <Button
                      variant="contained"
                      className={classes.dangerButton}
                      disabled={restartingBackend}
                      onClick={handleRestartBackend}
                      startIcon={<RefreshOutlined />}
                    >
                      {restartingBackend
                        ? i18n.t("settings.restartBackend.restarting")
                        : i18n.t("settings.restartBackend.button")}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}
        />
      </Grid>
    </>
  );
}