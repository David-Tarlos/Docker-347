# Modul 347 – Teil B: Docker CLI – Erste Schritte

Diese Datei gehört zur Abgabe [`KN-01.md`](./KN-01.md) und listet alle
verwendeten Docker-CLI-Befehle mit kurzer Erklärung auf.

## Übersicht der ausgeführten Befehle

### 1. Docker-Version überprüfen
```bash
docker --version
```
Zeigt die installierte Docker-Version an.

---

### 2. Nach offiziellen Images suchen
```bash
docker search ubuntu
docker search nginx
```
`docker search` durchsucht Docker Hub nach Images. Das offizielle Image
erkennt man in der Spalte **OFFICIAL** am Eintrag `[OK]`.

---

### 3. Erklärung des Befehls `docker run -d -p 80:80 docker/getting-started`

| Parameter | Bedeutung |
|---|---|
| `docker run` | Erstellt und startet einen Container aus einem Image (kombiniert `pull` + `create` + `start`) |
| `-d` | *Detached Mode* – Container läuft im Hintergrund und blockiert nicht das Terminal |
| `-p 80:80` | Port-Mapping `Host:Container` – Host-Port 80 wird auf Container-Port 80 weitergeleitet, dadurch ist der Container über `http://localhost` erreichbar |
| `docker/getting-started` | Name des Images auf Docker Hub, das verwendet wird |

---

### 4. nginx – `docker run` aufgeteilt in `pull`, `create`, `start`

#### 4.1 Image herunterladen
```bash
docker pull nginx
```

#### 4.2 Container erstellen mit Port-Mapping 8081 → 80
```bash
docker create -p 8081:80 --name mein-nginx nginx
```

#### 4.3 Container starten
```bash
docker start mein-nginx
```
Falls ein anderer Container Port 8081 belegt: zuerst stoppen mit
`docker stop <name>`.

#### 4.4 Webseite aufrufen
URL im Browser: `http://localhost:8081`
→ **Screenshot 1: nginx-Standardseite mit sichtbarer URL**

---

### 5. ubuntu – nicht jedes Image läuft im Hintergrund

#### 5.1 `docker run -d ubuntu`
```bash
docker run -d ubuntu
docker ps -a
```
**Kommentar:** Das Ubuntu-Image wurde automatisch von Docker Hub
heruntergeladen, da es lokal noch nicht vorhanden war. Der Container
startet zwar, beendet sich aber sofort wieder (Status "Exited"). Grund:
Ubuntu ist nur ein Basis-Betriebssystem ohne langlebigen
Vordergrund-Prozess. Ein Container lebt nur solange sein Hauptprozess
läuft – ohne aktiven Prozess gibt es nichts auszuführen und der Container
terminiert.

#### 5.2 `docker run -it ubuntu`
```bash
docker run -it ubuntu
```
**Kommentar:** Mit `-i` (interactive) und `-t` (TTY/Terminal) startet
Docker eine interaktive Shell im Container. Jetzt läuft `bash` als
Vordergrund-Prozess und hält den Container am Leben. Man landet direkt
im Prompt des Ubuntu-Containers (z.B. `root@abc123:/#`) und kann Befehle
wie `ls`, `cat /etc/os-release` usw. ausführen. Mit `exit` wird die
Shell beendet – und damit auch der Container, da der Hauptprozess endet.

---

### 6. Interaktive Shell im laufenden nginx-Container

```bash
docker exec -it mein-nginx /bin/bash
```
`docker exec` führt einen Befehl in einem **bereits laufenden** Container
aus – im Gegensatz zu `docker run`, das einen neuen Container erstellt.

#### 6.1 nginx-Status innerhalb des Containers
```bash
service nginx status
```
→ **Screenshot 2: Befehl und Resultat von `service nginx status`**

#### 6.2 Shell verlassen
```bash
exit
```
Der nginx-Container läuft weiter, weil nginx selbst der Hauptprozess
ist – nicht die bash, die wir beendet haben.

---

### 7. Status aller Container prüfen
```bash
docker ps -a
```
→ **Screenshot 3: Befehl und Resultat von `docker ps -a`**

`docker ps` zeigt nur laufende Container, `docker ps -a` zeigt **alle**
Container (auch gestoppte/beendete).

---

### 8. nginx-Container stoppen
```bash
docker stop mein-nginx
```

---

### 9. Alle Container entfernen
```bash
docker rm mein-nginx
docker rm <weitere-container-ids>
```
Alternativ alle auf einmal (PowerShell):
```powershell
docker rm (docker ps -aq)
```
Oder in Linux/macOS-Shell:
```bash
docker rm $(docker ps -aq)
```

---

### 10. Images entfernen
```bash
docker rmi nginx ubuntu
```
`docker rmi` (remove image) löscht die Images aus der lokalen Umgebung.
Voraussetzung: kein Container nutzt das Image mehr.

---

---

## Teil D – Privates Repository

### 11. Am Docker Hub anmelden
```bash
docker login
```
Authentifiziert die lokale Docker-CLI gegenüber Docker Hub – nötig vor
jedem `docker push`.

---

### 12. nginx-Image taggen und pushen
```bash
docker pull nginx
docker tag nginx:latest david-tarlos/docker-347:nginx
docker push david-tarlos/docker-347:nginx
```
`docker tag` vergibt einen zusätzlichen Namen für ein vorhandenes Image
(keine Kopie, gleiche Image-ID). `docker push` lädt das so umbenannte
Image in das eigene Docker-Hub-Repository hoch.

---

### 13. mariadb-Image taggen und pushen
```bash
docker pull mariadb
docker tag mariadb:latest david-tarlos/docker-347:mariadb
docker push david-tarlos/docker-347:mariadb
```
Gleiches Vorgehen wie bei nginx. Anschliessend enthält das Repository
`david-tarlos/docker-347` zwei Tags: `nginx` und `mariadb`.

---

## Abgaben

- [x] Diese Datei mit allen Befehlen und Erklärungen
- [x] Screenshot 1: nginx-Standardseite unter `http://localhost:8081`
- [x] Screenshot 2: `service nginx status` im Container
- [x] Screenshot 3: `docker ps -a` mit allen Containern
- [ ] Screenshot 4: Docker-Hub-Repository mit Tags `nginx` und `mariadb`
