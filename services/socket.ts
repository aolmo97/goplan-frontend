import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, APP_CONFIG } from '../config';

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(userId: string): Socket | null {
    if (!this.socket) {
      try {
        this.socket = io(SOCKET_URL, {
          auth: { userId },
          timeout: APP_CONFIG.SOCKET_TIMEOUT,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
        });

        this.setupSocketListeners();
      } catch (error) {
        console.error('Error al conectar con el socket:', error);
        return null;
      }
    }
    return this.socket;
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Conectado al servidor de socket');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Desconectado del servidor de socket:', reason);
      if (reason === 'io server disconnect') {
        // El servidor forzó la desconexión
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Máximo de intentos de reconexión alcanzado');
        this.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Error de socket:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  joinPlanRoom(planId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_plan', planId);
    } else {
      console.warn('No hay conexión con el socket al intentar unirse al plan');
    }
  }

  leavePlanRoom(planId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_plan', planId);
    }
  }

  sendMessage(planId: string, message: string) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', { planId, message });
      return true;
    } else {
      console.warn('No hay conexión con el socket al intentar enviar mensaje');
      return false;
    }
  }

  onNewMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  onPlanUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('plan_update', callback);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    return 'connecting';
  }
}

export default SocketService.getInstance();
