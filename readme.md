# Tag Panel
Esta aplicação foi desenvolvida com o intuito de facilitar o deploy de pequenas aplicações.
> Desenvolvido por Tiago Guirra a fins de estudos sobre a api do docker

## Deploy via git
Após configurado rodando o ambiente do tagpanel, com o comando push do git a aplicação efetua automaticamente o build e o deploy do projeto

## Requisitos
- Ter o git instalado
- Ter o node e npm instalado
- Ter o docker instalado
- Ter o mongo instalado localmente ou remotamente
- SO linux
- Ter o nginx instalado e configurado

## Instalação
- Faça dowload da aplicação e em seguida instale as dependências via npm
```bash
npm i
```
- Crie um arquivo chamado '.env' contendo as variáveis exemplares de .env.template

## Executando em desenvolvimento
O modo de desenvolvimento usa o nodemon com hot reload quando algum arquivo for alterado
```bash
npm run dev
```

## Executando em produção
No modo de produção deve ser feito o build e depois o start da aplicação
Fazendo o build 
```bash
npm run build
```
Start da aplicação
```bash
npm start
```

## Proximas features
- Homologar o deploy de servicos
- Implementar o sistema de administradores e autenticação
- Implementar comunicação real-time (Socket.io) com notificações de deploy e status
- Implementar interface web


### Pontos finais
Esta aplicação não deve ser usada em produção pois se trata de um estudo inicial podendo conter bugs e instabilidades.
