import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  RefreshRequest,
  LogoutRequest,
  FindAllRcasRequest,
  FindByIdRequest,
  CreateRcaRequest,
  Rca,
  RcaList,
} from './types';

// Load the proto file from the app root so it resolves in Next.js build output
const protoPath = path.join(process.cwd(), 'src/proto/fixapp.proto');
const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

type UnaryCallback<T> = (error: grpc.ServiceError | null, response: T) => void;

type AuthServiceClient = {
  login: (request: LoginRequest, callback: UnaryCallback<AuthResponse>) => void;
  signup: (request: SignupRequest, callback: UnaryCallback<AuthResponse>) => void;
  refreshToken: (request: RefreshRequest, callback: UnaryCallback<AuthResponse>) => void;
  logout: (request: LogoutRequest, callback: UnaryCallback<{ success: boolean }>) => void;
};

type RcaServiceClient = {
  findAll: (request: FindAllRcasRequest, callback: UnaryCallback<RcaList>) => void;
  findById: (request: FindByIdRequest, callback: UnaryCallback<Rca | null>) => void;
  create: (request: CreateRcaRequest, callback: UnaryCallback<Rca>) => void;
};

type GrpcConstructor<TClient> = new (
  address: string,
  credentials: grpc.ChannelCredentials
) => TClient;

type FixappProto = {
  fixapp: {
    AuthService: GrpcConstructor<AuthServiceClient>;
    RcaService: GrpcConstructor<RcaServiceClient>;
  };
};

const proto = grpc.loadPackageDefinition(packageDefinition) as unknown as FixappProto;

// Get gRPC host from environment
function getGrpcHost(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_GRPC_HOST || 'localhost:50051';
  }
  return process.env.GRPC_HOST || 'localhost:50051';
}

// Create gRPC clients
function createAuthClient() {
  const credentials = grpc.credentials.createInsecure();
  return new proto.fixapp.AuthService(getGrpcHost(), credentials);
}

function createRcaClient() {
  const credentials = grpc.credentials.createInsecure();
  return new proto.fixapp.RcaService(getGrpcHost(), credentials);
}

// Promise-based wrappers
export const grpcAuth = {
  login: (request: LoginRequest): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      const client = createAuthClient();
      client.login(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  },

  signup: (request: SignupRequest): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      const client = createAuthClient();
      client.signup(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  },

  refreshToken: (request: RefreshRequest): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      const client = createAuthClient();
      client.refreshToken(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  },

  logout: (request: LogoutRequest): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
      const client = createAuthClient();
      client.logout(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  },
};

export const grpcRca = {
  findAll: (request: FindAllRcasRequest): Promise<RcaList> => {
    return new Promise((resolve, reject) => {
      const client = createRcaClient();
      client.findAll(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  },

  findById: (request: FindByIdRequest): Promise<Rca | null> => {
    return new Promise((resolve, reject) => {
      const client = createRcaClient();
      client.findById(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  },

  create: (request: CreateRcaRequest): Promise<Rca> => {
    return new Promise((resolve, reject) => {
      const client = createRcaClient();
      client.create(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  },
};
