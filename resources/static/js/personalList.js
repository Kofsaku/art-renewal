// Personal List JavaScript - Clean Version with Sort Functionality

// Sample data for demonstration
let personalData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 30;
let currentFilters = {};
let columnOrder = ['select', 'personalSend', 'registrationStatus', 'personalCode', 'managementNumber', 'name', 'katakana', 'tenantNumber', 'departmentCode', 'kubunCode', 'gatePermissions', 'actions'];
let hiddenColumns = [];
let sortState = { column: null, direction: 'asc' };

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('個人情報一覧 JavaScript 読み込み開始...');
    
    // 視覚的確認用
    const debugDiv = document.createElement('div');
    debugDiv.innerHTML = '🟢 JavaScript読み込み中...';
    debugDiv.style.cssText = 'position: fixed; top: 100px; right: 20px; background: #d4edda; padding: 10px; border-radius: 5px; z-index: 9999;';
    document.body.appendChild(debugDiv);
    
    setTimeout(() => {
        console.log('サンプルデータ生成開始...');
        generateSampleData();
        console.log('サンプルデータ生成完了:', personalData.length, '件');
        
        setupEventListeners();
        console.log('イベントリスナー設定完了');
        
        updateTableHeaders();
        console.log('テーブルヘッダー更新完了');
        
        applyFiltersAndDisplay();
        console.log('フィルター適用・表示完了');
        
        debugDiv.innerHTML = '✅ 初期化完了！データ件数: ' + personalData.length;
        setTimeout(() => {
            if (debugDiv.parentNode) {
                document.body.removeChild(debugDiv);
            }
        }, 3000);
        
        console.log('個人情報一覧 初期化完了');
    }, 100);
});

// Generate sample data for testing
function generateSampleData() {
    const departments = ['総務部', '営業部', 'システム部', '経理部', '人事部', '開発部', '企画部'];
    const categories = ['正社員', '契約社員', '派遣社員', 'アルバイト', '役員'];
    const firstNames = ['太郎', '花子', '次郎', '美子', '三郎', '恵子', '四郎', '智子', '五郎', '由美'];
    const lastNames = ['田中', '佐藤', '鈴木', '高橋', '渡辺', '伊藤', '中村', '小林', '加藤', '吉田'];
    const katakanaParts = ['タナカ', 'サトウ', 'スズキ', 'タカハシ', 'ワタナベ', 'イトウ', 'ナカムラ', 'コバヤシ', 'カトウ', 'ヨシダ'];
    
    personalData = [];
    for (let i = 1; i <= 1000; i++) {
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const katakanaName = katakanaParts[Math.floor(Math.random() * katakanaParts.length)];
        const department = departments[Math.floor(Math.random() * departments.length)];
        
        personalData.push({
            id: i,
            personalSend: Math.random() > 0.3 ? '送信済' : '未送信',
            registrationStatus: Math.random() > 0.8 ? '登録中' : '登録完了',
            personalCode: `kojin${String(i).padStart(4, '0')}`,
            managementNumber: `no${String(i).padStart(4, '0')}`,
            name: `${lastName} ${firstName}`,
            katakana: `${katakanaName} ${firstNames[Math.floor(Math.random() * firstNames.length)].replace('郎', 'ロウ').replace('子', 'コ')}`,
            tenantNumber: `tenant${String(i).padStart(3, '0')}`,
            departmentCode: department,
            kubunCode: categories[Math.floor(Math.random() * categories.length)],
            gatePermissions: generateGatePermissions(),
            selected: false
        });
    }
    filteredData = [...personalData];
}

// Generate gate permissions for gates 1-10
function generateGatePermissions() {
    const permissions = [];
    for (let i = 1; i <= 10; i++) {
        const rand = Math.random();
        if (rand < 0.6) {
            permissions.push(Math.floor(Math.random() * 10).toString());
        } else if (rand < 0.8) {
            permissions.push('C');
        } else if (rand < 0.9) {
            permissions.push('R');
        } else {
            permissions.push('-');
        }
    }
    return permissions;
}

// Setup event listeners
function setupEventListeners() {
    console.log('イベントリスナー設定完了');
}

// Update table headers with sort functionality
function updateTableHeaders() {
    const thead = document.querySelector('#personalTable thead tr');
    const columnDefinitions = {
        'select': { title: '<input type="checkbox" id="selectAll" onchange="toggleSelectAll()">', sortable: false },
        'personalSend': { title: '個人送信', sortable: true },
        'registrationStatus': { title: '登録状態', sortable: true },
        'personalCode': { title: '個人コード', sortable: true },
        'managementNumber': { title: '管理番号', sortable: true },
        'name': { title: '氏名', sortable: true },
        'katakana': { title: 'カタカナ', sortable: true },
        'tenantNumber': { title: 'テナント番号', sortable: true },
        'departmentCode': { title: '所属', sortable: true },
        'kubunCode': { title: '区分', sortable: true },
        'gatePermissions': { title: 'ゲート権限 (1-10)', sortable: false },
        'actions': { title: '操作', sortable: false }
    };
    
    thead.innerHTML = '';
    
    columnOrder.forEach(columnKey => {
        if (hiddenColumns.includes(columnKey)) return;
        
        const def = columnDefinitions[columnKey];
        if (!def) return;
        
        const th = document.createElement('th');
        th.setAttribute('data-column', columnKey);
        
        if (def.sortable) {
            th.classList.add('sortable');
            th.addEventListener('click', () => handleSort(columnKey));
            
            // ソート状態の表示
            if (sortState.column === columnKey) {
                th.classList.add(sortState.direction === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        }
        
        th.innerHTML = def.title;
        thead.appendChild(th);
    });
}

// Handle column sorting
function handleSort(columnKey) {
    console.log(`ソート実行: ${columnKey}`);
    
    // ソート状態の更新
    if (sortState.column === columnKey) {
        sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortState.column = columnKey;
        sortState.direction = 'asc';
    }
    
    // データのソート
    filteredData.sort((a, b) => {
        let aValue = a[columnKey] || '';
        let bValue = b[columnKey] || '';
        
        // 数値っぽい場合は数値としてソート
        if (!isNaN(aValue) && !isNaN(bValue)) {
            aValue = parseFloat(aValue);
            bValue = parseFloat(bValue);
        } else {
            // 文字列として比較
            aValue = aValue.toString().toLowerCase();
            bValue = bValue.toString().toLowerCase();
        }
        
        if (aValue < bValue) {
            return sortState.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortState.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
    
    // ページを1に戻してテーブル更新
    currentPage = 1;
    updateTableHeaders();
    displayCurrentPage();
    updatePagination();
    
    console.log(`ソート完了: ${columnKey} ${sortState.direction}`);
}

// Apply filters and display data
function applyFiltersAndDisplay() {
    filteredData = personalData.filter(item => {
        for (const [columnKey, filterValues] of Object.entries(currentFilters)) {
            if (!filterValues || filterValues.length === 0) continue;
            if (!filterValues.includes(item[columnKey])) {
                return false;
            }
        }
        return true;
    });
    
    updatePagination();
    displayCurrentPage();
    updateCurrentCountDisplay();
}

// Display current page data - Clean Version
function displayCurrentPage() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);

    const tbody = document.getElementById('personalTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    pageData.forEach(person => {
        const row = document.createElement('tr');
        row.className = 'personal-row';
        row.dataset.personId = person.id;
        row.dataset.personName = person.name;
        row.style.cursor = 'pointer';

        let rowHTML = '';
        columnOrder.forEach(columnKey => {
            if (hiddenColumns.includes(columnKey)) return;

            let cellContent = '';
            switch (columnKey) {
                case 'select':
                    cellContent = `<input type="checkbox" value="${person.id}" onchange="togglePersonSelection(${person.id}, this.checked)" onclick="event.stopPropagation();">`;
                    break;
                case 'gatePermissions':
                    cellContent = generateGatePermissionsDisplay(person.gatePermissions, person.id);
                    break;
                case 'actions':
                    cellContent = `<span class="text-muted small">ダブルクリック：編集 / 右クリック：履歴</span>`;
                    break;
                default:
                    cellContent = person[columnKey] || '';
                    break;
            }
            rowHTML += `<td>${cellContent}</td>`;
        });

        row.innerHTML = rowHTML;

        // ダブルクリック → 編集
        row.addEventListener('dblclick', (e) => {
            e.preventDefault();
            console.log(`${person.name} ダブルクリック → 編集`);
            openEditPage(person.id, person.name);
        });

        // 右クリック → 履歴
        row.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            console.log(`${person.name} 右クリック → 履歴`);
            showHistoryModal(person.id, person.name);
        });

        // Ctrl+クリックでも編集（フォールバック）
        row.addEventListener('click', (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                console.log(`${person.name} Ctrl+クリック → 編集`);
                openEditPage(person.id, person.name);
            }
        });

        tbody.appendChild(row);
    });

    console.log(`テーブル表示完了: ${pageData.length}行`);
}

// Generate gate permissions display
function generateGatePermissionsDisplay(permissions, personId) {
    const stats = calculatePermissionStats(permissions);
    
    return `
        <div class="gate-permissions">
            <div class="permission-stats">
                <span class="permission-indicator access"></span>${stats.access}
                <span class="permission-indicator no-access"></span>${stats.noAccess}
                <span class="permission-indicator restricted"></span>${stats.restricted}
            </div>
        </div>
    `;
}

// Calculate permission statistics
function calculatePermissionStats(permissions) {
    return {
        access: permissions.filter(p => /\d/.test(p)).length,
        noAccess: permissions.filter(p => p === 'C').length,
        restricted: permissions.filter(p => p === 'R').length,
        none: permissions.filter(p => p === '-').length
    };
}

// Update current count display
function updateCurrentCountDisplay() {
    const countElement = document.getElementById('currentCountValue');
    if (countElement) {
        countElement.textContent = filteredData.length.toLocaleString();
    }
}

// Show history modal
function showHistoryModal(personId, personName) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'historyModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-history text-info"></i>
                        履歴表示設定 - ${personName}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>期間</h6>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="periodToday" value="today">
                                <label class="form-check-label" for="periodToday">当日</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="periodYesterday" value="yesterday">
                                <label class="form-check-label" for="periodYesterday">前日～</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="periodWeek" value="week">
                                <label class="form-check-label" for="periodWeek">1週間前～</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6>履歴種類</h6>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="historyAll" value="all">
                                <label class="form-check-label" for="historyAll">全て</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="historyLightError" value="light-error">
                                <label class="form-check-label" for="historyLightError">軽エラー</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="historyHeavyError" value="heavy-error">
                                <label class="form-check-label" for="historyHeavyError">重エラー</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="historyRecovery" value="recovery">
                                <label class="form-check-label" for="historyRecovery">重エラー復旧</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                    <button type="button" class="btn btn-primary" onclick="executeHistorySearch('${personId}', '${personName}')">
                        <i class="fas fa-play"></i> 実行
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// Execute history search
function executeHistorySearch(personId, personName) {
    const selectedPeriod = document.querySelector('input[name="historyPeriod"]:checked');
    const selectedType = document.querySelector('input[name="historyType"]:checked');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('historyModal'));
    modal.hide();
    
    alert(`${personName}の履歴検索を実行します`);
}

// Update pagination
function updatePagination() {
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
        pageInfo.innerHTML = `${start}-${end} / ${totalItems}件中 (全件数: <span id="totalCount">${personalData.length}</span>件)`;
    }
    
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';
    
    // Previous button
    const prevButton = document.createElement('li');
    prevButton.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevButton.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage - 1})">前へ</a>`;
    pagination.appendChild(prevButton);
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('li');
        pageButton.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageButton.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
        pagination.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('li');
    nextButton.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextButton.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage + 1})">次へ</a>`;
    pagination.appendChild(nextButton);
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        displayCurrentPage();
        updatePagination();
    }
}

// Change items per page
function changeItemsPerPage() {
    itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
    currentPage = 1;
    applyFiltersAndDisplay();
}

// Toggle select all
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('#personalTableBody input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
        const personId = parseInt(checkbox.value);
        togglePersonSelection(personId, checkbox.checked);
    });
}

// Toggle person selection
function togglePersonSelection(personId, selected) {
    const person = personalData.find(p => p.id === personId);
    if (person) {
        person.selected = selected;
    }
}

// Action button functions
function addNewPerson() {
    console.log('新規登録画面に遷移');
    window.location.href = '/resources/personalRegistration-preview.html';
}

function bulkDelete() {
    const selectedPeople = personalData.filter(p => p.selected);
    if (selectedPeople.length === 0) {
        alert('削除する個人を選択してください');
        return;
    }
    if (confirm(`選択された${selectedPeople.length}件のデータを削除しますか？`)) {
        personalData = personalData.filter(p => !p.selected);
        applyFiltersAndDisplay();
        alert('削除が完了しました');
    }
}

function bulkErase() {
    const selectedPeople = personalData.filter(p => p.selected);
    if (selectedPeople.length === 0) {
        alert('消去する個人を選択してください');
        return;
    }
    if (confirm(`選択された${selectedPeople.length}件のデータを完全に消去しますか？`)) {
        personalData = personalData.filter(p => !p.selected);
        applyFiltersAndDisplay();
        alert('消去が完了しました');
    }
}

function uploadData() {
    console.log('データアップロード機能');
    // ファイル選択ダイアログを表示
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            alert(`${file.name} のアップロードを開始します`);
            // ここで実際のアップロード処理を実装
        }
    };
    input.click();
}

function downloadData() {
    console.log('データダウンロード機能');
    // 現在表示中のデータをCSV形式でダウンロード
    const csvData = generateCSV();
    downloadCSV(csvData, 'personal_list.csv');
}

function generateCSV() {
    const headers = ['個人コード', '氏名', 'カタカナ', '所属', '区分', '送信状態'];
    const csvRows = [headers.join(',')];
    
    filteredData.forEach(person => {
        const row = [
            person.personalCode,
            person.name,
            person.katakana,
            person.departmentCode,
            person.kubunCode,
            person.personalSend
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

function downloadCSV(csvData, filename) {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function editDepartment() {
    console.log('所属管理画面に遷移');
    // 所属管理画面のURLに遷移（実装に応じて調整）
    window.location.href = '/resources/departmentManagement.html';
}

function editCategory() {
    console.log('区分管理画面に遷移');
    // 区分管理画面のURLに遷移（実装に応じて調整）
    window.location.href = '/resources/categoryManagement.html';
}

function manageTimeRestrictions() {
    console.log('入退室制限時間帯管理画面に遷移');
    // 時間帯管理画面のURLに遷移（実装に応じて調整）
    window.location.href = '/resources/timeRestrictionManagement.html';
}

function bulkChangeGatePermissions() {
    console.log('通門権限一括変更画面に遷移');
    // 権限管理画面のURLに遷移（実装に応じて調整）
    window.location.href = '/resources/gatePermissionManagement.html';
}

function sendPersonalData() {
    const selectedPeople = personalData.filter(p => p.selected);
    if (selectedPeople.length === 0) {
        alert('送信する個人を選択してください');
        return;
    }
    if (confirm(`選択された${selectedPeople.length}件のデータを送信しますか？`)) {
        selectedPeople.forEach(person => {
            person.personalSend = '送信済';
        });
        applyFiltersAndDisplay();
        alert('送信が完了しました');
    }
}

function resetFilters() {
    currentFilters = {};
    applyFiltersAndDisplay();
}

function showColumnManager() {
    alert('列表示管理機能');
}

// 編集画面を開く
function openEditPage(personId, personName) {
    console.log(`編集画面遷移: ${personName} (ID: ${personId})`);
    
    // 個人情報登録/編集画面に遷移（IDをパラメータとして渡す）
    const editUrl = `/resources/personalRegistration-preview.html?id=${personId}&name=${encodeURIComponent(personName)}`;
    console.log(`遷移URL: ${editUrl}`);
    window.location.href = editUrl;
}

// 履歴モーダルを表示（元々あったモーダル）
function showHistoryModal(personId, personName) {
    console.log(`履歴モーダル表示: ${personName} (ID: ${personId})`);
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'historyModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-history text-info"></i>
                        履歴表示設定 - ${personName}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="fas fa-user"></i>
                        <strong>${personName}</strong> (ID: ${personId}) の履歴を表示します
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <h6><i class="fas fa-calendar"></i> 期間選択</h6>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="historyPeriod" id="periodToday" value="today" checked>
                                <label class="form-check-label" for="periodToday">当日</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="historyPeriod" id="periodYesterday" value="yesterday">
                                <label class="form-check-label" for="periodYesterday">前日～</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="historyPeriod" id="periodWeek" value="week">
                                <label class="form-check-label" for="periodWeek">1週間前～</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6><i class="fas fa-filter"></i> 履歴種類</h6>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="historyAll" value="all" checked>
                                <label class="form-check-label" for="historyAll">全て</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="historyLightError" value="light-error">
                                <label class="form-check-label" for="historyLightError">軽エラー</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="historyHeavyError" value="heavy-error">
                                <label class="form-check-label" for="historyHeavyError">重エラー</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="historyRecovery" value="recovery">
                                <label class="form-check-label" for="historyRecovery">重エラー復旧</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                    <button type="button" class="btn btn-primary" onclick="executeHistorySearch('${personId}', '${personName}')">
                        <i class="fas fa-arrow-right"></i> 履歴画面へ遷移
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// 履歴検索実行
function executeHistorySearch(personId, personName) {
    const period = document.querySelector('input[name="historyPeriod"]:checked').value;
    const historyTypes = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        historyTypes.push(checkbox.value);
    });
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('historyModal'));
    modal.hide();
    
    const periodText = { 'today': '当日', 'yesterday': '前日～', 'week': '1週間前～' }[period];
    console.log(`履歴検索実行: ${personName} - ${periodText} - ${historyTypes.join(', ')}`);
    
    // 履歴レポート画面に遷移（パラメータ付き）
    const historyUrl = `/resources/historyReport-preview.html?personId=${personId}&name=${encodeURIComponent(personName)}&period=${period}&types=${historyTypes.join(',')}`;
    console.log(`履歴画面遷移URL: ${historyUrl}`);
    window.location.href = historyUrl;
}