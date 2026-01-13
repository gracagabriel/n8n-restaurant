"use strict";
// ==========================================
// Auth Service
// ==========================================
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
let AuthService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = _classThis = class {
        constructor(usersService, jwtService, configService) {
            this.usersService = usersService;
            this.jwtService = jwtService;
            this.configService = configService;
        }
        /**
         * Registrar novo usuário
         */
        async register(email, name, password) {
            // Validações básicas
            if (!email || !name || !password) {
                throw new common_1.BadRequestException('Email, nome e senha são obrigatórios');
            }
            if (password.length < 6) {
                throw new common_1.BadRequestException('Senha deve ter no mínimo 6 caracteres');
            }
            // Criar usuário
            const user = await this.usersService.create(email, name, password);
            // Gerar tokens
            const tokens = this.generateTokens(user.id, user.email, user.role);
            return {
                user,
                ...tokens,
            };
        }
        /**
         * Login de usuário
         */
        async login(email, password) {
            // Validações
            if (!email || !password) {
                throw new common_1.BadRequestException('Email e senha são obrigatórios');
            }
            // Encontrar usuário
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                throw new common_1.UnauthorizedException('Email ou senha incorretos');
            }
            // Validar senha
            const isPasswordValid = await this.usersService.validatePassword(password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Email ou senha incorretos');
            }
            // Gerar tokens
            const tokens = this.generateTokens(user.id, user.email, user.role);
            // Retornar sem a senha
            const { password: _, ...userWithoutPassword } = user;
            return {
                user: userWithoutPassword,
                ...tokens,
            };
        }
        /**
         * Gerar access token e refresh token
         */
        generateTokens(userId, email, role) {
            const payload = { sub: userId, email, role };
            const accessToken = this.jwtService.sign(payload, {
                expiresIn: '15m', // 15 minutos
            });
            const refreshToken = this.jwtService.sign(payload, {
                expiresIn: '7d', // 7 dias
            });
            return { accessToken, refreshToken };
        }
        /**
         * Renovar access token usando refresh token
         */
        async refreshToken(refreshToken) {
            try {
                const payload = this.jwtService.verify(refreshToken);
                const newAccessToken = this.jwtService.sign({ sub: payload.sub, email: payload.email, role: payload.role }, { expiresIn: '15m' });
                return { accessToken: newAccessToken };
            }
            catch (error) {
                throw new common_1.UnauthorizedException('Refresh token inválido ou expirado');
            }
        }
        /**
         * Validar token JWT (usado pelo JwtStrategy)
         */
        async validateJwtPayload(payload) {
            const user = await this.usersService.findById(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException('Usuário não encontrado');
            }
            return user;
        }
    };
    __setFunctionName(_classThis, "AuthService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
})();
exports.AuthService = AuthService;
