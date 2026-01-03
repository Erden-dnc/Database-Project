<?php
require_once 'config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

try {
    switch ($action) {
        // ========== THESIS OPERATIONS ==========
        case 'get_tezler':
            $sql = "SELECT t.thesis_id AS tez_id,
                    t.thesis_number AS tez_no,
                    t.title AS başlık,
                    t.abstract AS özet,
                    t.year AS yıl,
                    t.type AS tür,
                    t.page_count AS sayfa_sayısı,
                    t.language AS dil,
                    t.submission_date AS teslim_tarihi,
                    CONCAT(y.first_name, ' ', y.last_name) AS yazar_adi,
                    u.university_name AS universite_adi,
                    e.institute_name AS enstitü_adi
                    FROM Thesis t
                    JOIN Author y ON t.author_id = y.author_id
                    JOIN University u ON t.university_id = u.university_id
                    JOIN Institute e ON t.institute_id = e.institute_id
                    ORDER BY t.year DESC, t.thesis_number DESC";
            $stmt = $pdo->query($sql);
            echo json_encode($stmt->fetchAll());
            break;

        case 'get_tez':
            $id = $_GET['id'] ?? 0;
            $sql = "SELECT t.thesis_id AS tez_id,
                    t.thesis_number AS tez_no,
                    t.title AS başlık,
                    t.abstract AS özet,
                    t.year AS yıl,
                    t.type AS tür,
                    t.page_count AS sayfa_sayısı,
                    t.language AS dil,
                    t.submission_date AS teslim_tarihi,
                    CONCAT(y.first_name, ' ', y.last_name) AS yazar_adi,
                    y.email AS yazar_email,
                    u.university_name AS universite_adi,
                    e.institute_name AS enstitü_adi
                    FROM Thesis t
                    JOIN Author y ON t.author_id = y.author_id
                    JOIN University u ON t.university_id = u.university_id
                    JOIN Institute e ON t.institute_id = e.institute_id
                    WHERE t.thesis_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id]);
            $tez = $stmt->fetch();
            
            if (!$tez) {
                http_response_code(404);
                echo json_encode(['error' => 'Thesis not found']);
                break;
            }
            
            // Get advisors
            $sql2 = "SELECT d.advisor_id AS danışman_id,
                    d.first_name AS ad,
                    d.last_name AS soyad,
                    d.title AS unvan,
                    d.email,
                    d.phone AS telefon,
                    td.role AS rol 
                    FROM Thesis_Advisor td
                    JOIN Advisor d ON td.advisor_id = d.advisor_id
                    WHERE td.thesis_id = ?";
            $stmt2 = $pdo->prepare($sql2);
            $stmt2->execute([$id]);
            $tez['danışmanlar'] = $stmt2->fetchAll();
            
            // Get topics
            $sql3 = "SELECT k.topic_id AS konu_id,
                    k.topic_name AS konu_adi
                    FROM Thesis_Topic tk
                    JOIN Topic k ON tk.topic_id = k.topic_id
                    WHERE tk.thesis_id = ?";
            $stmt3 = $pdo->prepare($sql3);
            $stmt3->execute([$id]);
            $tez['konular'] = $stmt3->fetchAll();
            
            // Get keywords
            $sql4 = "SELECT ak.keyword_id AS anahtar_kelime_id,
                    ak.word AS kelime
                    FROM Thesis_Keyword tak
                    JOIN Keyword ak ON tak.keyword_id = ak.keyword_id
                    WHERE tak.thesis_id = ?";
            $stmt4 = $pdo->prepare($sql4);
            $stmt4->execute([$id]);
            $tez['anahtar_kelimeler'] = $stmt4->fetchAll();
            
            echo json_encode($tez);
            break;

        case 'search_tezler':
            $baslik = $_GET['baslik'] ?? '';
            $yazar = $_GET['yazar'] ?? '';
            $yil = $_GET['yil'] ?? '';
            $tur = $_GET['tur'] ?? '';
            $universite = $_GET['universite'] ?? '';
            $dil = $_GET['dil'] ?? '';
            
            $sql = "SELECT DISTINCT t.thesis_id AS tez_id,
                    t.thesis_number AS tez_no,
                    t.title AS başlık,
                    t.abstract AS özet,
                    t.year AS yıl,
                    t.type AS tür,
                    t.page_count AS sayfa_sayısı,
                    t.language AS dil,
                    t.submission_date AS teslim_tarihi,
                    CONCAT(y.first_name, ' ', y.last_name) AS yazar_adi,
                    u.university_name AS universite_adi,
                    e.institute_name AS enstitü_adi
                    FROM Thesis t
                    JOIN Author y ON t.author_id = y.author_id
                    JOIN University u ON t.university_id = u.university_id
                    JOIN Institute e ON t.institute_id = e.institute_id
                    WHERE 1=1";
            
            $params = [];
            if ($baslik) {
                $sql .= " AND t.title LIKE ?";
                $params[] = "%$baslik%";
            }
            if ($yazar) {
                $sql .= " AND (y.first_name LIKE ? OR y.last_name LIKE ?)";
                $params[] = "%$yazar%";
                $params[] = "%$yazar%";
            }
            if ($yil) {
                $sql .= " AND t.year = ?";
                $params[] = $yil;
            }
            if ($tur) {
                $sql .= " AND t.type = ?";
                $params[] = $tur;
            }
            if ($universite) {
                $sql .= " AND u.university_id = ?";
                $params[] = $universite;
            }
            if ($dil) {
                $sql .= " AND t.language = ?";
                $params[] = $dil;
            }
            
            $sql .= " ORDER BY t.year DESC, t.thesis_number DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            echo json_encode($stmt->fetchAll());
            break;

        case 'add_tez':
            $pdo->beginTransaction();
            
            // Author check or add
            $yazar_id = $input['yazar_id'] ?? null;
            if (!$yazar_id && isset($input['yeni_yazar'])) {
                $sql = "INSERT INTO Author (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $input['yeni_yazar']['ad'],
                    $input['yeni_yazar']['soyad'],
                    $input['yeni_yazar']['email'] ?? null,
                    $input['yeni_yazar']['telefon'] ?? null
                ]);
                $yazar_id = $pdo->lastInsertId();
            }
            
            // Add thesis
            $sql = "INSERT INTO Thesis (thesis_number, title, abstract, author_id, year, type, university_id, institute_id, page_count, language, submission_date) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $input['tez_no'],
                $input['başlık'],
                $input['özet'] ?? null,
                $yazar_id,
                $input['yıl'],
                $input['tür'],
                $input['universite_id'],
                $input['enstitü_id'],
                $input['sayfa_sayısı'] ?? null,
                $input['dil'],
                $input['teslim_tarihi']
            ]);
            $tez_id = $pdo->lastInsertId();
            
            // Add advisors
            if (isset($input['danışmanlar'])) {
                foreach ($input['danışmanlar'] as $danisman) {
                    $sql = "INSERT INTO Thesis_Advisor (thesis_id, advisor_id, role) VALUES (?, ?, ?)";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$tez_id, $danisman['danışman_id'], $danisman['rol']]);
                }
            }
            
            // Add topics
            if (isset($input['konular'])) {
                foreach ($input['konular'] as $konu_id) {
                    $sql = "INSERT INTO Thesis_Topic (thesis_id, topic_id) VALUES (?, ?)";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$tez_id, $konu_id]);
                }
            }
            
            // Add keywords
            if (isset($input['anahtar_kelimeler'])) {
                foreach ($input['anahtar_kelimeler'] as $kelime) {
                    // Check or add keyword
                    $sql = "SELECT keyword_id FROM Keyword WHERE word = ?";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$kelime]);
                    $ak = $stmt->fetch();
                    
                    if (!$ak) {
                        $sql = "INSERT INTO Keyword (word) VALUES (?)";
                        $stmt = $pdo->prepare($sql);
                        $stmt->execute([$kelime]);
                        $ak_id = $pdo->lastInsertId();
                    } else {
                        $ak_id = $ak['keyword_id'];
                    }
                    
                    $sql = "INSERT INTO Thesis_Keyword (thesis_id, keyword_id) VALUES (?, ?)";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$tez_id, $ak_id]);
                }
            }
            
            $pdo->commit();
            echo json_encode(['success' => true, 'tez_id' => $tez_id]);
            break;

        // ========== PARENT TABLE OPERATIONS ==========
        case 'get_universiteler':
            $stmt = $pdo->query("SELECT university_id AS universite_id, university_name AS universite_adi, foundation_year AS kurulus_yili FROM University ORDER BY university_name");
            echo json_encode($stmt->fetchAll());
            break;

        case 'add_universite':
            $sql = "INSERT INTO University (university_name, foundation_year) VALUES (?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$input['universite_adi'], $input['kurulus_yili'] ?? null]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            break;

        case 'get_enstituler':
            $universite_id = $_GET['universite_id'] ?? null;
            if ($universite_id) {
                $stmt = $pdo->prepare("SELECT institute_id AS enstitü_id, institute_name AS enstitü_adi, university_id AS universite_id FROM Institute WHERE university_id = ? ORDER BY institute_name");
                $stmt->execute([$universite_id]);
            } else {
                $stmt = $pdo->query("SELECT e.institute_id AS enstitü_id, e.institute_name AS enstitü_adi, e.university_id AS universite_id, u.university_name AS universite_adi FROM Institute e JOIN University u ON e.university_id = u.university_id ORDER BY u.university_name, e.institute_name");
            }
            echo json_encode($stmt->fetchAll());
            break;

        case 'add_enstitü':
            $sql = "INSERT INTO Institute (institute_name, university_id) VALUES (?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$input['enstitü_adi'], $input['universite_id']]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            break;

        case 'get_yazarlar':
            $stmt = $pdo->query("SELECT author_id AS yazar_id, first_name AS ad, last_name AS soyad, email, phone AS telefon FROM Author ORDER BY last_name, first_name");
            echo json_encode($stmt->fetchAll());
            break;

        case 'add_yazar':
            $sql = "INSERT INTO Author (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $input['ad'],
                $input['soyad'],
                $input['email'] ?? null,
                $input['telefon'] ?? null
            ]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            break;

        case 'get_danışmanlar':
            $stmt = $pdo->query("SELECT advisor_id AS danışman_id, first_name AS ad, last_name AS soyad, title AS unvan, email, phone AS telefon FROM Advisor ORDER BY last_name, first_name");
            echo json_encode($stmt->fetchAll());
            break;

        case 'add_danışman':
            $sql = "INSERT INTO Advisor (first_name, last_name, title, email, phone) VALUES (?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $input['ad'],
                $input['soyad'],
                $input['unvan'] ?? null,
                $input['email'] ?? null,
                $input['telefon'] ?? null
            ]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            break;

        case 'get_konular':
            $stmt = $pdo->query("SELECT topic_id AS konu_id, topic_name AS konu_adi FROM Topic ORDER BY topic_name");
            echo json_encode($stmt->fetchAll());
            break;

        case 'add_konu':
            $sql = "INSERT INTO Topic (topic_name) VALUES (?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$input['konu_adi']]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            break;

        default:
            http_response_code(404);
            echo json_encode(['error' => 'Action not found']);
    }
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
