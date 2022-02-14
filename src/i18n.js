import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// TODO: move translations to separate JSON Files
const resources = {
  en: {
    translation: {
      newConversation: "New:",
      newConversationName: "Conversation name",
      yourName: "Name",
      joinConversation: "Join conversation",
      createConversation: "Create conversation",
      createdConversation: "Conversation created",
      joinedConversation: "<0>{{name}}</0> joined the conversation",
      youJoinedConversation: "You joined the conversation",
      leftConversation: "<0>{{name}}</0> left the conversation",
      youLeftConversation: "You left the conversation",
      typeMessage: "Type a message",
      leaveConversation: "Leave",
    },
  },
  "pt-BR": {
    translation: {
      newConversation: "Nova:",
      newConversationName: "Nome da conversa",
      yourName: "Nome",
      joinConversation: "Entrar na conversa",
      createConversation: "Criar conversa",
      createdConversation: "Conversa criada",
      joinedConversation: "<0>{{name}}</0> entrou na conversa",
      youJoinedConversation: "Você entrou na conversa",
      leftConversation: "<0>{{name}}</0> saiu da conversa",
      youLeftConversation: "Você saiu da conversa",
      typeMessage: "Digite uma mensagem",
      leaveConversation: "Sair",
    },
  },
};

i18n
  .use(LanguageDetector)

  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources,
  });

export default i18n;
