
import React, { useContext, useEffect, useRef, useState } from "react";

import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import OnlyForSuperUser from "../OnlyForSuperUser";
import { AuthContext } from "../../context/Auth/AuthContext";
import useSettings from "../../hooks/useSettings";

import { IconButton, InputAdornment, Typography, Box } from "@material-ui/core";

import {
  Colorize,
  AttachFile,
  Delete,
  Add,
  Save,
  PaletteOutlined,
  ImageOutlined,
  LinkOutlined,
  WallpaperOutlined
} from "@material-ui/icons";
import ColorPicker from "../ColorPicker";
import ColorModeContext from "../../layout/themeContext";
import api from "../../services/api";
import { getBackendURL } from "../../services/config";
import { i18nToast } from "../../helpers/i18nToast";
import { i18n } from "../../translate/i18n.js";

const defaultLogoLight = "/vector/logo.svg";
const defaultLogoDark = "/vector/logo-dark.svg";
const defaultLogoFavicon = "/vector/favicon.svg";
const LOGIN_LINKS_KEY = "loginPageLinks";
const LOGIN_SIDE_PANEL_IMAGE_KEY = "loginSidePanelImage";
const LOGIN_BACKGROUND_CONTENT_KEY = "loginBackgroundContent";

const createEmptyLink = () => ({ title: "", url: "" });

const parseLinksSetting = value => {
  if (!value) {
    return [createEmptyLink()];
  }

  try {
    const parsedValue = JSON.parse(value);

    if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
      return [createEmptyLink()];
    }

    return parsedValue.map(link => ({
      title: typeof link?.title === "string" ? link.title : "",
      url: typeof link?.url === "string" ? link.url : ""
    }));
  } catch (error) {
    return [createEmptyLink()];
  }
};

const serializeLinksSetting = links =>
  JSON.stringify(
    links
      .map(link => ({
        title: link.title.trim(),
        url: link.url.trim()
      }))
      .filter(link => link.title && link.url)
  );

const isVideoFile = (filename = "") => /\.(mp4|webm|ogg)$/i.test(filename);

const getPublicFileUrl = filename => {
  if (!filename) {
    return "";
  }

  return `${getBackendURL()}/public/${filename}`;
};

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
    }
  },
  colorAdorment: {
    width: 20,
    height: 20,
    borderRadius: "6px",
    border: "2px solid #ffffff",
    boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.15)"
  },
  // Ícones de ação dos campos (upload, delete)
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
  uploadInput: {
    display: "none"
  },
  helperText: {
    fontSize: "0.75rem",
    color: "#94a3b8",
    marginTop: theme.spacing(0.75),
    lineHeight: 1.5
  },
  // Previews de logo modernizados
  logoPreviewLight: {
    backgroundColor: "#ffffff",
    padding: theme.spacing(3),
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100px",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)"
  },
  logoPreviewDark: {
    backgroundColor: "#1e293b",
    padding: theme.spacing(3),
    borderRadius: "12px",
    border: "1px solid #334155",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100px",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)"
  },
  logoPreviewFavicon: {
    backgroundColor: "#f1f5f9",
    padding: theme.spacing(3),
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100px",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)"
  },
  appLogoLightPreviewImg: {
    maxWidth: "100%",
    maxHeight: 72,
    content: `url("${theme.calculatedLogoLight()}")`
  },
  appLogoDarkPreviewImg: {
    maxWidth: "100%",
    maxHeight: 72,
    content: `url("${theme.calculatedLogoDark()}")`
  },
  appLogoFaviconPreviewImg: {
    maxWidth: "100%",
    maxHeight: 72,
    content: `url("${theme.appLogoFavicon ? theme.appLogoFavicon : "/vector/favicon.svg"}")`
  },
  // Linha de link modernizada
  linkRow: {
    padding: theme.spacing(2),
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: theme.spacing(1.5)
  },
  linkActions: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      alignItems: "stretch"
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
  // Preview de mídia
  previewBox: {
    minHeight: 200,
    height: "100%",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2),
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)"
  },
  previewContent: {
    width: "100%",
    height: "100%",
    maxHeight: 300,
    objectFit: "contain",
    borderRadius: "8px"
  },
  previewContentCover: {
    width: "100%",
    height: "100%",
    maxHeight: 300,
    objectFit: "cover",
    borderRadius: "8px"
  },
  emptyPreview: {
    color: "#94a3b8",
    fontSize: "0.85rem",
    textAlign: "center"
  }
}));

export default function Whitelabel(props) {
  const { settings } = props;
  const classes = useStyles();
  const [settingsLoaded, setSettingsLoaded] = useState({});
  const [loginLinks, setLoginLinks] = useState([createEmptyLink()]);

  const { user: currentUser } = useContext(AuthContext);

  const { colorMode } = useContext(ColorModeContext);
  const [primaryColorLightModalOpen, setPrimaryColorLightModalOpen] =
    useState(false);
  const [primaryColorDarkModalOpen, setPrimaryColorDarkModalOpen] =
    useState(false);

  const logoLightInput = useRef(null);
  const logoDarkInput = useRef(null);
  const logoFaviconInput = useRef(null);
  const loginSidePanelImageInput = useRef(null);
  const loginBackgroundContentInput = useRef(null);
  const [appName, setAppName] = useState("");

  const { update } = useSettings();

  useEffect(() => {
    if (!Array.isArray(settings) || settings.length === 0) {
      return;
    }

    const primaryColorLight = settings.find(
      setting => setting.key === "primaryColorLight"
    )?.value;
    const primaryColorDark = settings.find(
      setting => setting.key === "primaryColorDark"
    )?.value;
    const appLogoLight = settings.find(
      setting => setting.key === "appLogoLight"
    )?.value;
    const appLogoDark = settings.find(
      setting => setting.key === "appLogoDark"
    )?.value;
    const appLogoFavicon = settings.find(
      setting => setting.key === "appLogoFavicon"
    )?.value;
    const loadedAppName = settings.find(
      setting => setting.key === "appName"
    )?.value;
    const loadedLoginLinks = settings.find(
      setting => setting.key === LOGIN_LINKS_KEY
    )?.value;
    const loginSidePanelImage = settings.find(
      setting => setting.key === LOGIN_SIDE_PANEL_IMAGE_KEY
    )?.value;
    const loginBackgroundContent = settings.find(
      setting => setting.key === LOGIN_BACKGROUND_CONTENT_KEY
    )?.value;

    setAppName(loadedAppName || "");
    setLoginLinks(parseLinksSetting(loadedLoginLinks));
    setSettingsLoaded({
      primaryColorLight,
      primaryColorDark,
      appLogoLight,
      appLogoDark,
      appLogoFavicon,
      appName: loadedAppName,
      loginPageLinks: loadedLoginLinks,
      loginSidePanelImage,
      loginBackgroundContent
    });
  }, [settings]);

  const updateSettingsLoaded = (key, value) => {
    setSettingsLoaded(currentSettings => ({
      ...currentSettings,
      [key]: value
    }));
  };

  const handleSaveSetting = async (key, value) => {
    await update({
      key,
      value
    });
    updateSettingsLoaded(key, value);
    i18nToast.success("settings.success");
  };

  const uploadLogo = async (event, mode) => {
    if (!event.target.files) {
      return;
    }

    const file = event.target.files[0];
    const formData = new FormData();

    formData.append("file", file);
    formData.append("mode", mode);

    api
      .post("/settings/logo", formData, {
        onUploadProgress: progressEvent => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`A imagem está ${progress}% carregada... `);
        }
      })
      .then(response => {
        updateSettingsLoaded(`appLogo${mode}`, response.data);
        colorMode[`setAppLogo${mode}`](
          `${getBackendURL()}/public/${response.data}`
        );
        i18nToast.success("settings.success");
      })
      .catch(error => {
        console.error("Houve um problema ao realizar o upload da imagem.");
        console.log(error);
      })
      .finally(() => {
        event.target.value = "";
      });
  };

  const uploadPublicFile = async (event, settingKey) => {
    if (!event.target.files) {
      return;
    }

    const file = event.target.files[0];
    const formData = new FormData();

    formData.append("file", file);
    formData.append("settingKey", settingKey);

    api
      .post("/settings/publicFile", formData, {
        onUploadProgress: progressEvent => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`O arquivo está ${progress}% carregado... `);
        }
      })
      .then(response => {
        updateSettingsLoaded(settingKey, response.data);
        i18nToast.success("settings.success");
      })
      .catch(error => {
        console.error("Houve um problema ao realizar o upload do arquivo.");
        console.log(error);
      })
      .finally(() => {
        event.target.value = "";
      });
  };

  const handleLinkChange = (index, field, value) => {
    setLoginLinks(currentLinks =>
      currentLinks.map((link, linkIndex) =>
        linkIndex === index ? { ...link, [field]: value } : link
      )
    );
  };

  const handleAddLink = () => {
    setLoginLinks(currentLinks => [...currentLinks, createEmptyLink()]);
  };

  const handleRemoveLink = index => {
    setLoginLinks(currentLinks => {
      if (currentLinks.length === 1) {
        return [createEmptyLink()];
      }

      return currentLinks.filter((_, linkIndex) => linkIndex !== index);
    });
  };

  const handleSaveLinks = async () => {
    const serializedLinks = serializeLinksSetting(loginLinks);

    await handleSaveSetting(LOGIN_LINKS_KEY, serializedLinks);
    setLoginLinks(parseLinksSetting(serializedLinks));
  };

  const renderMediaPreview = (filename, previewMode = "contain") => {
    if (!filename) {
      return (
        <div className={classes.emptyPreview}>
          {i18n.t("whitelabel.noFileSelected")}
        </div>
      );
    }

    const fileUrl = getPublicFileUrl(filename);
    const previewClassName =
      previewMode === "cover"
        ? classes.previewContentCover
        : classes.previewContent;

    if (isVideoFile(filename)) {
      return (
        <video className={previewClassName} controls muted playsInline>
          <source src={fileUrl} />
        </video>
      );
    }

    return <img className={previewClassName} src={fileUrl} alt={filename} />;
  };

  return (
    <>
      <Grid spacing={3} container>
        <OnlyForSuperUser
          user={currentUser}
          yes={() => (
            <>
              {/* SEÇÃO: Cores e Identidade */}
              <Grid xs={12} item>
                <Box className={classes.sectionCard}>
                  <Box className={classes.sectionHeader}>
                    <PaletteOutlined />
                    <Typography className={classes.sectionTitle}>
                      Cores e Identidade
                    </Typography>
                  </Box>
                  <Typography className={classes.sectionDescription}>
                    Personalize as cores principais da aplicação e o nome exibido.
                  </Typography>

                  <Grid spacing={2} container>
                    <Grid xs={12} sm={6} md={4} item>
                      <FormControl
                        variant="outlined"
                        className={classes.selectContainer}
                      >
                        <TextField
                          id="primary-color-light-field"
                          label={i18n.t("whitelabel.primaryColorLight")}
                          variant="outlined"
                          value={settingsLoaded.primaryColorLight || ""}
                          onClick={() => setPrimaryColorLightModalOpen(true)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <div
                                  style={{
                                    backgroundColor:
                                      settingsLoaded.primaryColorLight
                                  }}
                                  className={classes.colorAdorment}
                                />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <IconButton
                                size="small"
                                className={classes.fieldAction}
                                onClick={() =>
                                  setPrimaryColorLightModalOpen(true)
                                }
                              >
                                <Colorize />
                              </IconButton>
                            )
                          }}
                        />
                      </FormControl>
                      <ColorPicker
                        open={primaryColorLightModalOpen}
                        handleClose={() => setPrimaryColorLightModalOpen(false)}
                        onChange={color => {
                          setPrimaryColorLightModalOpen(false);
                          handleSaveSetting("primaryColorLight", color);
                          colorMode.setPrimaryColorLight(color);
                        }}
                      />
                    </Grid>
                    <Grid xs={12} sm={6} md={4} item>
                      <FormControl
                        variant="outlined"
                        className={classes.selectContainer}
                      >
                        <TextField
                          id="primary-color-dark-field"
                          label={i18n.t("whitelabel.primaryColorDark")}
                          variant="outlined"
                          value={settingsLoaded.primaryColorDark || ""}
                          onClick={() => setPrimaryColorDarkModalOpen(true)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <div
                                  style={{
                                    backgroundColor:
                                      settingsLoaded.primaryColorDark
                                  }}
                                  className={classes.colorAdorment}
                                />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <IconButton
                                size="small"
                                className={classes.fieldAction}
                                onClick={() =>
                                  setPrimaryColorDarkModalOpen(true)
                                }
                              >
                                <Colorize />
                              </IconButton>
                            )
                          }}
                        />
                      </FormControl>
                      <ColorPicker
                        open={primaryColorDarkModalOpen}
                        handleClose={() => setPrimaryColorDarkModalOpen(false)}
                        onChange={color => {
                          setPrimaryColorDarkModalOpen(false);
                          handleSaveSetting("primaryColorDark", color);
                          colorMode.setPrimaryColorDark(color);
                        }}
                      />
                    </Grid>
                    <Grid xs={12} sm={6} md={4} item>
                      <FormControl
                        variant="outlined"
                        className={classes.selectContainer}
                      >
                        <TextField
                          id="appname-field"
                          label={i18n.t("whitelabel.appname")}
                          variant="outlined"
                          name="appName"
                          value={appName}
                          onChange={event => {
                            setAppName(event.target.value);
                          }}
                          onBlur={async () => {
                            await handleSaveSetting("appName", appName);
                            colorMode.setAppName(appName || "ticketz");
                          }}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* SEÇÃO: Logos */}
              <Grid xs={12} item>
                <Box className={classes.sectionCard}>
                  <Box className={classes.sectionHeader}>
                    <ImageOutlined />
                    <Typography className={classes.sectionTitle}>
                      Logos da Aplicação
                    </Typography>
                  </Box>
                  <Typography className={classes.sectionDescription}>
                    Faça upload dos logos usados nos modos claro, escuro e favicon.
                  </Typography>

                  <Grid spacing={2} container>
                    <Grid xs={12} sm={6} md={4} item>
                      <FormControl className={classes.selectContainer}>
                        <TextField
                          id="logo-light-upload-field"
                          label={i18n.t("whitelabel.lightLogo")}
                          variant="outlined"
                          value={settingsLoaded.appLogoLight || ""}
                          InputProps={{
                            endAdornment: (
                              <>
                                {settingsLoaded.appLogoLight && (
                                  <IconButton
                                    size="small"
                                    className={`${classes.fieldAction} ${classes.deleteAction}`}
                                    onClick={() => {
                                      handleSaveSetting("appLogoLight", "");
                                      colorMode.setAppLogoLight(
                                        defaultLogoLight
                                      );
                                    }}
                                  >
                                    <Delete />
                                  </IconButton>
                                )}
                                <input
                                  type="file"
                                  id="upload-logo-light-button"
                                  ref={logoLightInput}
                                  className={classes.uploadInput}
                                  onChange={event =>
                                    uploadLogo(event, "Light")
                                  }
                                />
                                <label htmlFor="upload-logo-light-button">
                                  <IconButton
                                    size="small"
                                    className={classes.fieldAction}
                                    component="span"
                                  >
                                    <AttachFile />
                                  </IconButton>
                                </label>
                              </>
                            )
                          }}
                        />
                      </FormControl>
                      <Typography className={classes.helperText}>
                        {i18n.t("whitelabel.logoHint")}
                      </Typography>
                    </Grid>
                    <Grid xs={12} sm={6} md={4} item>
                      <FormControl className={classes.selectContainer}>
                        <TextField
                          id="logo-dark-upload-field"
                          label={i18n.t("whitelabel.darkLogo")}
                          variant="outlined"
                          value={settingsLoaded.appLogoDark || ""}
                          InputProps={{
                            endAdornment: (
                              <>
                                {settingsLoaded.appLogoDark && (
                                  <IconButton
                                    size="small"
                                    className={`${classes.fieldAction} ${classes.deleteAction}`}
                                    onClick={() => {
                                      handleSaveSetting("appLogoDark", "");
                                      colorMode.setAppLogoDark(defaultLogoDark);
                                    }}
                                  >
                                    <Delete />
                                  </IconButton>
                                )}
                                <input
                                  type="file"
                                  id="upload-logo-dark-button"
                                  ref={logoDarkInput}
                                  className={classes.uploadInput}
                                  onChange={event => uploadLogo(event, "Dark")}
                                />
                                <label htmlFor="upload-logo-dark-button">
                                  <IconButton
                                    size="small"
                                    className={classes.fieldAction}
                                    component="span"
                                  >
                                    <AttachFile />
                                  </IconButton>
                                </label>
                              </>
                            )
                          }}
                        />
                      </FormControl>
                      <Typography className={classes.helperText}>
                        {i18n.t("whitelabel.logoHint")}
                      </Typography>
                    </Grid>
                    <Grid xs={12} sm={6} md={4} item>
                      <FormControl className={classes.selectContainer}>
                        <TextField
                          id="logo-favicon-upload-field"
                          label={i18n.t("whitelabel.favicon")}
                          variant="outlined"
                          value={settingsLoaded.appLogoFavicon || ""}
                          InputProps={{
                            endAdornment: (
                              <>
                                {settingsLoaded.appLogoFavicon && (
                                  <IconButton
                                    size="small"
                                    className={`${classes.fieldAction} ${classes.deleteAction}`}
                                    onClick={() => {
                                      handleSaveSetting(
                                        "appLogoFavicon",
                                        ""
                                      );
                                      colorMode.setAppLogoFavicon(
                                        defaultLogoFavicon
                                      );
                                    }}
                                  >
                                    <Delete />
                                  </IconButton>
                                )}
                                <input
                                  type="file"
                                  id="upload-logo-favicon-button"
                                  ref={logoFaviconInput}
                                  className={classes.uploadInput}
                                  onChange={event =>
                                    uploadLogo(event, "Favicon")
                                  }
                                />
                                <label htmlFor="upload-logo-favicon-button">
                                  <IconButton
                                    size="small"
                                    className={classes.fieldAction}
                                    component="span"
                                  >
                                    <AttachFile />
                                  </IconButton>
                                </label>
                              </>
                            )
                          }}
                        />
                      </FormControl>
                      <Typography className={classes.helperText}>
                        {i18n.t("whitelabel.faviconHint")}
                      </Typography>
                    </Grid>

                    {/* Previews */}
                    <Grid xs={12} sm={6} md={4} item>
                      <div className={classes.logoPreviewLight}>
                        <img
                          className={classes.appLogoLightPreviewImg}
                          alt="light-logo-preview"
                        />
                      </div>
                    </Grid>
                    <Grid xs={12} sm={6} md={4} item>
                      <div className={classes.logoPreviewDark}>
                        <img
                          className={classes.appLogoDarkPreviewImg}
                          alt="dark-logo-preview"
                        />
                      </div>
                    </Grid>
                    <Grid xs={12} sm={6} md={4} item>
                      <div className={classes.logoPreviewFavicon}>
                        <img
                          className={classes.appLogoFaviconPreviewImg}
                          alt="favicon-preview"
                        />
                      </div>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* SEÇÃO: Links do Login */}
              <Grid xs={12} item>
                <Box className={classes.sectionCard}>
                  <Box className={classes.sectionHeader}>
                    <LinkOutlined />
                    <Typography className={classes.sectionTitle}>
                      {i18n.t("whitelabel.loginLinks")}
                    </Typography>
                  </Box>
                  <Typography className={classes.sectionDescription}>
                    {i18n.t("whitelabel.loginLinksHint")}
                  </Typography>

                  {loginLinks.map((link, index) => (
                    <div
                      className={classes.linkRow}
                      key={`login-link-${index}`}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={12} md={4} item>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label={i18n.t("whitelabel.linkTitle")}
                            value={link.title}
                            className={classes.selectContainer}
                            onChange={event =>
                              handleLinkChange(
                                index,
                                "title",
                                event.target.value
                              )
                            }
                          />
                        </Grid>
                        <Grid xs={12} md={7} item>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label={i18n.t("whitelabel.linkUrl")}
                            value={link.url}
                            className={classes.selectContainer}
                            onChange={event =>
                              handleLinkChange(
                                index,
                                "url",
                                event.target.value
                              )
                            }
                          />
                        </Grid>
                        <Grid xs={12} md={1} item>
                          <IconButton
                            aria-label={i18n.t("whitelabel.removeLink")}
                            className={`${classes.fieldAction} ${classes.deleteAction}`}
                            onClick={() => handleRemoveLink(index)}
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </div>
                  ))}

                  <div className={classes.linkActions}>
                    <Button
                      className={classes.outlinedButton}
                      variant="outlined"
                      onClick={handleAddLink}
                      startIcon={<Add />}
                    >
                      {i18n.t("common.add")}
                    </Button>
                    <Button
                      className={classes.primaryButton}
                      color="primary"
                      variant="contained"
                      onClick={handleSaveLinks}
                      startIcon={<Save />}
                    >
                      {i18n.t("common.save")}
                    </Button>
                  </div>
                </Box>
              </Grid>

              {/* SEÇÃO: Imagens da Tela de Login */}
              <Grid xs={12} item>
                <Box className={classes.sectionCard}>
                  <Box className={classes.sectionHeader}>
                    <WallpaperOutlined />
                    <Typography className={classes.sectionTitle}>
                      Imagens da Tela de Login
                    </Typography>
                  </Box>
                  <Typography className={classes.sectionDescription}>
                    Personalize a imagem lateral e o conteúdo de fundo da tela de
                    login.
                  </Typography>

                  <Grid spacing={2} container>
                    <Grid xs={12} md={6} item>
                      <FormControl className={classes.selectContainer}>
                        <TextField
                          id="login-sidepanel-image-upload-field"
                          label={i18n.t("whitelabel.sidePanelImage")}
                          variant="outlined"
                          value={settingsLoaded.loginSidePanelImage || ""}
                          InputProps={{
                            endAdornment: (
                              <>
                                {settingsLoaded.loginSidePanelImage && (
                                  <IconButton
                                    size="small"
                                    className={`${classes.fieldAction} ${classes.deleteAction}`}
                                    onClick={() =>
                                      handleSaveSetting(
                                        LOGIN_SIDE_PANEL_IMAGE_KEY,
                                        ""
                                      )
                                    }
                                  >
                                    <Delete />
                                  </IconButton>
                                )}
                                <input
                                  type="file"
                                  id="upload-login-sidepanel-image-button"
                                  ref={loginSidePanelImageInput}
                                  className={classes.uploadInput}
                                  accept="image/*"
                                  onChange={event =>
                                    uploadPublicFile(
                                      event,
                                      LOGIN_SIDE_PANEL_IMAGE_KEY
                                    )
                                  }
                                />
                                <label htmlFor="upload-login-sidepanel-image-button">
                                  <IconButton
                                    size="small"
                                    className={classes.fieldAction}
                                    component="span"
                                  >
                                    <AttachFile />
                                  </IconButton>
                                </label>
                              </>
                            )
                          }}
                        />
                      </FormControl>
                      <Typography className={classes.helperText}>
                        {i18n.t("whitelabel.sidePanelImageHint")}
                      </Typography>
                    </Grid>
                    <Grid xs={12} md={6} item>
                      <FormControl className={classes.selectContainer}>
                        <TextField
                          id="login-background-content-upload-field"
                          label={i18n.t("whitelabel.backgroundContent")}
                          variant="outlined"
                          value={settingsLoaded.loginBackgroundContent || ""}
                          InputProps={{
                            endAdornment: (
                              <>
                                {settingsLoaded.loginBackgroundContent && (
                                  <IconButton
                                    size="small"
                                    className={`${classes.fieldAction} ${classes.deleteAction}`}
                                    onClick={() =>
                                      handleSaveSetting(
                                        LOGIN_BACKGROUND_CONTENT_KEY,
                                        ""
                                      )
                                    }
                                  >
                                    <Delete />
                                  </IconButton>
                                )}
                                <input
                                  type="file"
                                  id="upload-login-background-content-button"
                                  ref={loginBackgroundContentInput}
                                  className={classes.uploadInput}
                                  accept="image/*,video/mp4,video/webm,video/ogg"
                                  onChange={event =>
                                    uploadPublicFile(
                                      event,
                                      LOGIN_BACKGROUND_CONTENT_KEY
                                    )
                                  }
                                />
                                <label htmlFor="upload-login-background-content-button">
                                  <IconButton
                                    size="small"
                                    className={classes.fieldAction}
                                    component="span"
                                  >
                                    <AttachFile />
                                  </IconButton>
                                </label>
                              </>
                            )
                          }}
                        />
                      </FormControl>
                      <Typography className={classes.helperText}>
                        {i18n.t("whitelabel.backgroundContentHint")}
                      </Typography>
                    </Grid>

                    {/* Previews */}
                    <Grid xs={12} md={6} item>
                      <div className={classes.previewBox}>
                        {renderMediaPreview(
                          settingsLoaded.loginSidePanelImage
                        )}
                      </div>
                    </Grid>
                    <Grid xs={12} md={6} item>
                      <div className={classes.previewBox}>
                        {renderMediaPreview(
                          settingsLoaded.loginBackgroundContent,
                          "cover"
                        )}
                      </div>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </>
          )}
        />
      </Grid>
    </>
  );
}