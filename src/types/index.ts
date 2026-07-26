export interface BotConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
}

export interface BotStatus {
  connected: boolean;
  username: string;
  health: number;
  hunger: number;
  position: Position;
  dimension: string;
  afkMode: boolean;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface CommandRequest {
  command: string;
}

export interface ChatMessage {
  message: string;
  timestamp: number;
  sender: string;
}

export interface BotLog {
  timestamp: number;
  action: string;
  details: any;
}
