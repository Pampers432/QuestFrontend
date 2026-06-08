import * as signalR from "@microsoft/signalr";
import { Quest } from "@/Entities/Quest";
import { RoomTemplate } from "@/Entities/RoomTemplate";

class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private readonly hubUrl: string;

  constructor() {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7240";
    this.hubUrl = `${base}/questHub`;
  }

  public async startConnection(): Promise<void> {
    if (this.hubConnection) {
      console.log("[SignalR] Connection already exists");
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    try {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          accessTokenFactory: () => token || ""
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 20000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.hubConnection.on("QuestCreated", (quest: Quest) => {
        console.log("[SignalR] QuestCreated", quest);
        this.notifyQuestSubscribers("QuestCreated", quest);
      });

      this.hubConnection.on("QuestUpdated", (quest: Quest) => {
        console.log("[SignalR] QuestUpdated", quest);
        this.notifyQuestSubscribers("QuestUpdated", quest);
      });

      this.hubConnection.on("QuestDeleted", (questId: string) => {
        console.log("[SignalR] QuestDeleted", questId);
        this.notifyQuestSubscribers("QuestDeleted", questId);
      });

      this.hubConnection.on("TemplateCreated", (template: RoomTemplate) => {
        console.log("[SignalR] TemplateCreated", template);
        this.notifyTemplateSubscribers("TemplateCreated", template);
      });

      this.hubConnection.on("TemplateUpdated", (template: RoomTemplate) => {
        console.log("[SignalR] TemplateUpdated", template);
        this.notifyTemplateSubscribers("TemplateUpdated", template);
      });

      this.hubConnection.on("TemplateDeleted", (templateId: string) => {
        console.log("[SignalR] TemplateDeleted", templateId);
        this.notifyTemplateSubscribers("TemplateDeleted", templateId);
      });

      this.hubConnection.on("SubscribedToQuests", (message: string) => {
        console.log("[SignalR] SubscribedToQuests", message);
      });

      this.hubConnection.on("SubscribedToTemplates", (message: string) => {
        console.log("[SignalR] SubscribedToTemplates", message);
      });

      this.hubConnection.on("SubscribedToTemplate", (message: string) => {
        console.log("[SignalR] SubscribedToTemplate", message);
      });

      this.hubConnection.on("SubscribedToSessions", (message: string) => {
        console.log("[SignalR] SubscribedToSessions", message);
      });

      this.hubConnection.on("SubscribedToSession", (message: string) => {
        console.log("[SignalR] SubscribedToSession", message);
      });

      this.hubConnection.on("SessionUpdated", (sessionId: string) => {
        console.log("[SignalR] SessionUpdated", sessionId);
        this.notifySessionSubscribers("SessionUpdated", sessionId);
      });

      await this.hubConnection.start();
      console.log("[SignalR] Connected:", this.hubConnection.state);
    } catch (error) {
      console.error("[SignalR] Connection error:", error);
      throw error;
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
    }
  }

  public async subscribeToQuests(): Promise<void> {
    await this.hubConnection?.invoke("SubscribeQuests");
  }

  public async subscribeToTemplates(): Promise<void> {
    await this.hubConnection?.invoke("SubscribeTemplates");
  }

  public async subscribeToSession(sessionId: string): Promise<void> {
    await this.hubConnection?.invoke("SubscribeToSession", sessionId);
  }

  private notifyQuestSubscribers(event: string, data: any): void {
    window.dispatchEvent(new CustomEvent(`signalr:${event}`, { detail: data }));
  }

  private notifyTemplateSubscribers(event: string, data: any): void {
    window.dispatchEvent(new CustomEvent(`signalr:${event}`, { detail: data }));
  }

  private notifySessionSubscribers(event: string, data: any): void {
    window.dispatchEvent(new CustomEvent(`signalr:${event}`, { detail: data }));
  }

  public isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();
