# Servidor SFTP

Projeto do servidor SFTP somente para upload de arquivo. Quando recebido o arquivo, o mesmo é inserido no banco de dados.

Exemplo:
`sftp -P 8022 USER@HOST <<< $'put <FILE>`