import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("telajogos.db");

db.execSync(`
  CREATE TABLE IF NOT EXISTS tarefas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    texto TEXT NOT NULL,
    prioridade TEXT NOT NULL,
    horas INTEGER NOT NULL
  );
`);

function listar() {
    return db.getAllSync("SELECT * FROM tarefas ORDER BY id DESC");
}

function adicionar(texto, prioridade, horas) {
    db.runSync("INSERT INTO tarefas (texto, prioridade, horas) VALUES (?, ?, ?)", [texto, prioridade, horas]);
}

function remover(id) {
    db.runSync("DELETE FROM tarefas WHERE id = ?", [id]);
}

function edita(id, texto, prioridade, horas) {
    db.runSync("UPDATE tarefas SET texto = ?, prioridade = ?, horas = ? WHERE id = ?", [texto, prioridade, horas, id]);
}

export default function ListaDb() {

    const [texto, setTexto] = useState("");
    const [lista, setLista] = useState([]);
    const [prioridade, setPrioridade] = useState("");
    const [horas, setHoras] = useState("");
    const [idEditando, setIdEditando] = useState(0);

    function carregar() {
        setLista(listar());
    }

    useEffect(() => {
        carregar();
    }, []);

    function salvar() {
        adicionar(texto, prioridade, horas);
        setTexto("");
        setPrioridade("");
        setHoras("");
        carregar();
    }

    function excluir(id) {
        remover(id);
        carregar();
    }

    function editar(lista) {
        setIdEditando(lista.id);
        setTexto(lista.texto);
        setPrioridade(lista.prioridade);
        setHoras(lista.horas);
    }

    function guardarEdicao() {
        if (idEditando == 0) {
            salvar();
        } else {
            edita(idEditando, texto, prioridade, horas);
        }
        setTexto("");
        setIdEditando(0);
        setPrioridade("");
        setHoras("");
        carregar();
    }


    return (
        <SafeAreaView style={styles.tela} edges={["bottom"]}>
            <Stack.Screen options={{ title: "Lista de Jogos" }} />
            <Text style={styles.titulo}>Meus Jogos</Text>
            <TextInput
                style={styles.entrada}
                placeholder="Digite o nome do jogo..."
                value={texto}
                onChangeText={setTexto}
            />
            <TextInput
                style={styles.entrada}
                placeholder="Digite a plataforma..."
                value={prioridade}
                onChangeText={setPrioridade}
            />
            <TextInput
                style={styles.entrada}
                placeholder="Digite as horas..."
                keyboardType="numeric"
                value={horas}
                onChangeText={setHoras}
            />
            {idEditando !== 0 ? (
                <Button title="Guardar Edição" onPress={guardarEdicao} />
            ) : (
                <Button title="Salvar" onPress={salvar} />
            )}
            <FlatList
                data={lista}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <View style={styles.item}>
                            <Text style={styles.detalhe}><Text style={styles.rotulo}>Jogo: </Text>{item.texto}</Text>
                            <Text style={styles.detalhe}><Text style={styles.rotulo}>Plataforma: </Text>{item.prioridade}</Text>
                            <Text style={styles.detalhe}><Text style={styles.rotulo}>Horas: </Text>{item.horas}</Text>
                        </View>
                        <Button title="🗑️" color="#D64545" onPress={() => excluir(item.id)} />
                        <Button title="✏️" color="#48494b" onPress={() => editar(item)} />
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    titulo: {
        fontSize: 35,
        fontWeight: "bold",
        textAlign: "center",
    },
    entrada: {
        borderWidth: 1,
        borderColor: "#030303",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    item: {
        flex: 1,
        backgroundColor: "#F1F3F6",
        borderRadius: 8,
        padding: 12,
        gap: 4,
    },
    detalhe: {
        color: "#111827",
        fontSize: 15,
    },
    rotulo: {
        fontWeight: "bold",
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 8,
    },
});
//Olá casada >:)