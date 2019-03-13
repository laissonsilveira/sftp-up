#!/bin/bash

. /etc/init.d/functions

APP_DIR="/home2/c-sync-server"
NODE_APP="bin/c-sync-server"
PID_DIR="$APP_DIR/pid"
PID_FILE="$PID_DIR/c-sync.pid"
NODE_EXEC=/usr/bin/node

###############

# REDHAT chkconfig header

# chkconfig: - 58 74
# description: node-app is the script for starting a node app on boot.
### BEGIN INIT INFO
# Provides: node
# Required-Start:    $network $remote_fs $local_fs
# Required-Stop:     $network $remote_fs $local_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: start and stop node
# Description: Node process for app
### END INIT INFO

###############

USAGE="Usage: $0 {start|stop|restart|status} [--force]"
FORCE_OP=true

pid_file_exists() {
    [ -f "$PID_FILE" ]
}

get_pid() {
    echo "$(cat "$PID_FILE")"
}

is_running() {
    PID=$(get_pid)
    ! [ -z "$(ps aux | awk '{print $2}' | grep "^$PID$")" ]
}

start_it() {
    mkdir -p "$PID_DIR"

    echo "Iniciando C-Sync Server..."
    su - -c "export NODE_ENV=production; cd $APP_DIR; $NODE_EXEC $APP_DIR/$NODE_APP > /dev/null 2>&1 &"

    PID=$(ps aux  | awk '/home2\/c-sync-server\/bin\/c-sync-server/ {print $2}')
    echo $PID > $PID_FILE

    echo "C-Sync Server iniciado com PID: $PID"

}

stop_process() {
    PID=$(get_pid)
    echo "Finalizando processo: $PID"
    kill -9 $PID
}

remove_pid_file() {
    echo "Deletando arquivo PID"
    rm -f "$PID_FILE"
}

start_app() {
    if pid_file_exists
    then
        if is_running
        then
            PID=$(get_pid)
            echo "C-Sync Server já está em execução com o PID: $PID"
            exit 1
        else
            echo "C-Sync Server parado, mas foi encontrado arquivo PID"
            if [ $FORCE_OP = true ]
            then
                echo "Forçando inicialização"
                remove_pid_file
                start_it
            fi
        fi
    else
        start_it
    fi
}

stop_app() {
    if pid_file_exists
    then
        if is_running
        then
            echo "Finalizando C-Sync Server..."
            stop_process
            remove_pid_file
            echo "C-Sync Server finalizado"
        else
            echo "C-Sync Server já está parado, mas foi encontrado arquivo PID"
            if [ $FORCE_OP = true ]
            then
                echo "Forçando finalização..."
                remove_pid_file
                echo "C-Sync Server finalizado"
            else
                exit 1
            fi
        fi
    else
        echo "C-Sync Server já está parado, arquivo PID não encontrado"
        exit 1
    fi
}

status_app() {
    if pid_file_exists
    then
        if is_running
        then
            PID=$(get_pid)
            echo "C-Sync Server em execução com o PID: $PID"
        else
            echo "C-Sync Server parado, mas foi encontrado arquivo PID"
        fi
    else
        echo "C-Sync Server parado"
    fi
}

case "$2" in
    --force)
        FORCE_OP=true
    ;;

    "")
    ;;

    *)
        echo $USAGE
        exit 1
    ;;
esac

case "$1" in
    start)
        start_app
    ;;

    stop)
        stop_app
    ;;

    restart)
        stop_app
        start_app
    ;;

    status)
        status_app
    ;;

    *)
        echo $USAGE
        exit 1
    ;;
esac
