// Personal List JavaScript Functionality

// Sample data for demonstration (up to 1,000,000 records capacity)
let personalData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 30;
let currentFilters = {};
let columnOrder = ['select', 'personalSend', 'registrationStatus', 'personalCode', 'managementNumber', 'name', 'katakana', 'tenantNumber', 'departmentCode', 'kubunCode', 'gatePermissions', 'actions'];
let hiddenColumns = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    console.log('PersonalList JavaScript loading...');

    // Add visual confirmation
    const debugDiv = document.createElement('div');
    debugDiv.innerHTML = '🟢 個人リストJavaScript読み込み中...';
    debugDiv.style.cssText = 'position: fixed; top: 100px; right: 20px; background: #d4edda; padding: 10px; border-radius: 5px; z-index: 9999;';
    document.body.appendChild(debugDiv);

    // Test if we can add a simple click test
    window.testTableClick = function () {
        alert('テーブルテスト機能が動作しています！');
    };

    // Add global test functions for debugging
    window.testDoubleClick = function () {
        console.log('🔥 Test double click function called');
        alert('🔥 テストダブルクリック成功！');
    };

    window.testRightClick = function () {
        console.log('🔥 Test right click function called');
        alert('🔥 テスト右クリック成功！');
    };

    setTimeout(() => {
        console.log('🔥 personalList.js 初期化開始...');

        generateSampleData();
        console.log('🔥 Sample data generated:', personalData.length, 'records');

        setupEventListeners();
        console.log('🔥 Event listeners setup complete');

        updateTableHeaders();
        console.log('🔥 Table headers updated');

        applyFiltersAndDisplay();
        console.log('🔥 Filters applied and display updated');
        console.log('🔥 PersonalList initialization complete');

        debugDiv.innerHTML = '✅ 個人リスト初期化完了！データ件数: ' + personalData.length;

        // 初期化完了後にテーブル状態を確認
        setTimeout(() => {
            console.log('🔍 初期化後テーブル状態確認...');
            const tbody = document.getElementById('personalTableBody');
            if (tbody) {
                const rows = tbody.querySelectorAll('tr');
                console.log(`🔍 初期化後行数: ${rows.length}`);

                rows.forEach((row, index) => {
                    console.log(`🔍 初期化後行${index + 1}: className=${row.className}, hasEvents=${!!row.onclick || !!row.ondblclick}`);
                });
            }

            document.body.removeChild(debugDiv);
        }, 1000);
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
            departmentCode: `shozoku${String(i).padStart(3, '0')}`,
            kubunCode: `kubun${String(i).padStart(3, '0')}`,
            tumonCode: `tumon${String(i).padStart(3, '0')}`,
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
            permissions.push(Math.floor(Math.random() * 10).toString()); // 0-9 (access levels)
        } else if (rand < 0.8) {
            permissions.push('C'); // No access
        } else if (rand < 0.9) {
            permissions.push('R'); // Restricted (time-based)
        } else {
            permissions.push('-'); // No permission set
        }
    }
    return permissions;
}

// Generate gate permissions display with summary and expandable detail
function generateGatePermissionsDisplay(permissions, personId) {
    const stats = calculatePermissionStats(permissions);

    return `
        <div class="gate-permissions">
            <div class="gate-permissions-summary" onclick="toggleGatePermissionsDetail(${personId})">
                <div class="permission-stats">
                    <div class="permission-stat">
                        <span class="permission-indicator access"></span>
                        <span class="permission-count">${stats.access}</span>
                    </div>
                    <div class="permission-stat">
                        <span class="permission-indicator no-access"></span>
                        <span class="permission-count">${stats.noAccess}</span>
                    </div>
                    <div class="permission-stat">
                        <span class="permission-indicator restricted"></span>
                        <span class="permission-count">${stats.restricted}</span>
                    </div>
                </div>
                <i class="fas fa-chevron-down expand-icon"></i>
            </div>
            <div class="gate-permissions-detail" id="gate-detail-${personId}">
                <div class="gate-grid">
                    ${permissions.map((perm, index) => {
        let permClass = 'none';
        if (/\d/.test(perm)) permClass = 'access';
        else if (perm === 'C') permClass = 'no-access';
        else if (perm === 'R') permClass = 'restricted';

        return `
                            <div class="gate-item">
                                <div class="gate-number">G${String(index + 1).padStart(2, '0')}</div>
                                <div class="gate-permission ${permClass}" title="ゲート${String(index + 1).padStart(2, '0')}: ${getPermissionDescription(perm)}">${perm}</div>
                            </div>
                        `;
    }).join('')}
                </div>
                <div class="gate-legend">
                    <div class="legend-item">
                        <span class="permission-indicator access"></span>
                        <span>アクセス可能 (0-9)</span>
                    </div>
                    <div class="legend-item">
                        <span class="permission-indicator no-access"></span>
                        <span>アクセス不可 (C)</span>
                    </div>
                    <div class="legend-item">
                        <span class="permission-indicator restricted"></span>
                        <span>時間制限 (R)</span>
                    </div>
                    <div class="legend-item">
                        <span class="permission-indicator none"></span>
                        <span>未設定 (-)</span>
                    </div>
                </div>
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

// Get permission description
function getPermissionDescription(perm) {
    if (/\d/.test(perm)) return `アクセス可能 (レベル${perm})`;
    if (perm === 'C') return 'アクセス不可';
    if (perm === 'R') return '時間制限あり';
    return '未設定';
}

// Toggle gate permissions detail display
function toggleGatePermissionsDetail(personId) {
    // Close all other open details
    document.querySelectorAll('.gate-permissions-detail.show').forEach(detail => {
        if (detail.id !== `gate-detail-${personId}`) {
            detail.classList.remove('show');
            const icon = detail.previousElementSibling.querySelector('.expand-icon');
            if (icon) {
                icon.style.transform = 'rotate(0deg)';
            }
        }
    });

    // Toggle current detail
    const detail = document.getElementById(`gate-detail-${personId}`);
    const icon = detail.previousElementSibling.querySelector('.expand-icon');

    if (detail.classList.contains('show')) {
        detail.classList.remove('show');
        icon.style.transform = 'rotate(0deg)';
    } else {
        detail.classList.add('show');
        icon.style.transform = 'rotate(180deg)';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Close Excel filter menus when clicking outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.excel-filter-trigger') && !e.target.closest('.excel-filter-menu')) {
            hideAllExcelFilters();
        }
    });
}

// Setup table event prevention with maximum strength
function setupTableEventPrevention() {
    const table = document.getElementById('personalTable');
    if (!table) return;

    // Prevent ALL text selection on table body
    /*
    table.addEventListener('selectstart', function (e) {
        if (e.target.closest('tbody')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);
    */

    // Prevent ALL drag on table body
    /*
    table.addEventListener('dragstart', function (e) {
        if (e.target.closest('tbody')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);
    */

    // GLOBAL right-click prevention for entire table body
    /* 
    table.addEventListener('contextmenu', function(e) {
        if (e.target.closest('tbody')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);
    */

    // Additional global prevention for document level
    /*
    document.addEventListener('selectstart', function (e) {
        if (e.target.closest('#personalTable tbody')) {
            e.preventDefault();
            return false;
        }
    }, true);
    */

    /*
    document.addEventListener('contextmenu', function (e) {
        if (e.target.closest('#personalTable tbody')) {
            e.preventDefault();
            return false;
        }
    }, true);
    */

    console.log('✅ Table event prevention setup complete - MAXIMUM STRENGTH');
}

// Initialize column settings
function initializeColumnSettings() {
    const columnList = document.getElementById('columnList');
    const columnDefinitions = {
        'select': '選択',
        'personalCode': '個人コード',
        'name': '名称',
        'department': '所属名称',
        'category': '区分',
        'gatePermissions': 'ゲート権限',
        'validFrom': '有効期間（開始）',
        'validTo': '有効期間（終了）',
        'actions': '操作'
    };

    columnList.innerHTML = '';
    columnOrder.forEach(columnKey => {
        if (columnKey === 'actions') return; // Skip actions column in settings

        const columnItem = document.createElement('div');
        columnItem.className = 'column-item';
        columnItem.draggable = true;
        columnItem.dataset.column = columnKey;

        columnItem.innerHTML = `
            <div>
                <i class="fas fa-grip-vertical drag-handle"></i>
                <span>${columnDefinitions[columnKey]}</span>
            </div>
            <div>
                <input type="checkbox" ${hiddenColumns.includes(columnKey) ? '' : 'checked'} 
                       onchange="toggleColumnVisibility('${columnKey}', this.checked)">
            </div>
        `;

        columnList.appendChild(columnItem);
    });

    makeColumnListSortable();
}

// Make column list sortable
function makeColumnListSortable() {
    const columnList = document.getElementById('columnList');
    let draggedElement = null;

    columnList.addEventListener('dragstart', function (e) {
        if (e.target.classList.contains('column-item')) {
            draggedElement = e.target;
            e.target.classList.add('dragging');
        }
    });

    columnList.addEventListener('dragend', function (e) {
        if (e.target.classList.contains('column-item')) {
            e.target.classList.remove('dragging');
            draggedElement = null;
        }
    });

    columnList.addEventListener('dragover', function (e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(columnList, e.clientY);
        if (afterElement == null) {
            columnList.appendChild(draggedElement);
        } else {
            columnList.insertBefore(draggedElement, afterElement);
        }
    });
}

// Get drag after element
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.column-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Toggle column visibility
function toggleColumnVisibility(columnKey, visible) {
    if (visible) {
        hiddenColumns = hiddenColumns.filter(col => col !== columnKey);
    } else {
        if (!hiddenColumns.includes(columnKey)) {
            hiddenColumns.push(columnKey);
        }
    }
}

// Apply column settings
function applyColumnSettings() {
    // Update column order from the modal
    const columnItems = document.querySelectorAll('#columnList .column-item');
    columnOrder = Array.from(columnItems).map(item => item.dataset.column);
    columnOrder.push('actions'); // Always keep actions at the end

    // Update table headers and data
    updateTableStructure();
    applyFiltersAndDisplay();

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('columnSettingsModal'));
    modal.hide();
}

// Update table structure based on column settings
function updateTableStructure() {
    const table = document.getElementById('personalTable');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');

    // Clear existing headers
    thead.innerHTML = '';

    // Add headers in new order
    columnOrder.forEach(columnKey => {
        if (hiddenColumns.includes(columnKey)) return;

        const th = document.createElement('th');
        th.dataset.column = columnKey;

        switch (columnKey) {
            case 'select':
                th.innerHTML = '<input type="checkbox" id="selectAll" onchange="toggleSelectAll()">';
                break;
            case 'personalCode':
                th.innerHTML = '個人コード <i class="fas fa-caret-down filter-dropdown" onclick="showFilterDropdown(this, \'personalCode\')"></i><div class="dropdown-filter-menu" id="filter-personalCode"></div>';
                break;
            case 'name':
                th.innerHTML = '名称 <i class="fas fa-caret-down filter-dropdown" onclick="showFilterDropdown(this, \'name\')"></i><div class="dropdown-filter-menu" id="filter-name"></div>';
                break;
            case 'department':
                th.innerHTML = '所属名称 <i class="fas fa-caret-down filter-dropdown" onclick="showFilterDropdown(this, \'department\')"></i><div class="dropdown-filter-menu" id="filter-department"></div>';
                break;
            case 'category':
                th.innerHTML = '区分 <i class="fas fa-caret-down filter-dropdown" onclick="showFilterDropdown(this, \'category\')"></i><div class="dropdown-filter-menu" id="filter-category"></div>';
                break;
            case 'gatePermissions':
                th.innerHTML = 'ゲート権限 <i class="fas fa-caret-down filter-dropdown" onclick="showFilterDropdown(this, \'gatePermissions\')"></i><div class="dropdown-filter-menu" id="filter-gatePermissions"></div>';
                break;
            case 'validFrom':
                th.innerHTML = '有効期間（開始） <i class="fas fa-caret-down filter-dropdown" onclick="showFilterDropdown(this, \'validFrom\')"></i><div class="dropdown-filter-menu" id="filter-validFrom"></div>';
                break;
            case 'validTo':
                th.innerHTML = '有効期間（終了） <i class="fas fa-caret-down filter-dropdown" onclick="showFilterDropdown(this, \'validTo\')"></i><div class="dropdown-filter-menu" id="filter-validTo"></div>';
                break;
            case 'actions':
                th.innerHTML = '操作';
                break;
        }

        thead.appendChild(th);
    });
}

// Show Excel-like filter
function showExcelFilter(event, columnKey) {
    event.stopPropagation();
    hideAllExcelFilters();

    const filterMenu = document.getElementById(`excel-filter-${columnKey}`);
    if (!filterMenu) return;

    // Get unique values for this column
    const uniqueValues = [...new Set(personalData.map(item => {
        if (columnKey === 'gatePermissions') {
            return 'ゲート権限'; // Special handling
        }
        return item[columnKey];
    }))].sort();

    const currentFilterValues = currentFilters[columnKey] || [];
    const isFiltered = currentFilterValues.length > 0 && currentFilterValues.length < uniqueValues.length;

    filterMenu.innerHTML = `
        <div class="excel-filter-header">
            ${getColumnDisplayName(columnKey)} のフィルター
        </div>
        
        <div class="excel-search-section">
            <input type="text" class="excel-search-box" placeholder="検索テキストを入力" 
                   oninput="filterExcelOptions('${columnKey}', this.value)">
        </div>
        
        <div class="excel-filter-actions">
            <button class="excel-action-btn" onclick="selectAllExcelFilter('${columnKey}')">すべて選択</button>
            <button class="excel-action-btn" onclick="clearAllExcelFilter('${columnKey}')">すべてクリア</button>
            <button class="excel-action-btn primary" onclick="applyExcelFilter('${columnKey}')">OK</button>
        </div>
        
        <div class="excel-filter-list" id="excel-options-${columnKey}">
            <div class="excel-filter-item select-all" onclick="toggleExcelSelectAll('${columnKey}')">
                <input type="checkbox" id="select-all-${columnKey}" ${!isFiltered ? 'checked' : ''}>
                <span>（すべて選択）</span>
            </div>
            ${generateExcelFilterOptions(columnKey, uniqueValues, currentFilterValues)}
            <div class="excel-filter-resize-handle" onmousedown="startResize(event, '${columnKey}')"></div>
        </div>
        
        <div class="excel-filter-stats">
            ${uniqueValues.length}件中 ${currentFilterValues.length || uniqueValues.length}件を表示
        </div>
    `;

    filterMenu.classList.add('show');
}

function generateExcelFilterOptions(columnKey, values, currentFilter) {
    if (columnKey === 'gatePermissions') {
        // Special handling for gate permissions
        return `
            <div class="excel-filter-item" onclick="toggleExcelOption('${columnKey}', 'hasAccess')">
                <input type="checkbox" ${currentFilter.includes('hasAccess') ? 'checked' : ''}>
                <span>アクセス権限あり（0-9）</span>
            </div>
            <div class="excel-filter-item" onclick="toggleExcelOption('${columnKey}', 'noAccess')">
                <input type="checkbox" ${currentFilter.includes('noAccess') ? 'checked' : ''}>
                <span>アクセス不可（C）</span>
            </div>
            <div class="excel-filter-item" onclick="toggleExcelOption('${columnKey}', 'restricted')">
                <input type="checkbox" ${currentFilter.includes('restricted') ? 'checked' : ''}>
                <span>時間制限（R）</span>
            </div>
        `;
    } else {
        return values.map(value => {
            const isChecked = currentFilter.length === 0 || currentFilter.includes(value);
            return `
                <div class="excel-filter-item" onclick="toggleExcelOption('${columnKey}', '${value}')">
                    <input type="checkbox" ${isChecked ? 'checked' : ''}>
                    <span>${value}</span>
                </div>
            `;
        }).join('');
    }
}

function toggleExcelSelectAll(columnKey) {
    const selectAllCheckbox = document.getElementById(`select-all-${columnKey}`);
    const allCheckboxes = document.querySelectorAll(`#excel-options-${columnKey} .excel-filter-item:not(.select-all) input[type="checkbox"]`);

    selectAllCheckbox.checked = !selectAllCheckbox.checked;

    allCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

function toggleExcelOption(columnKey, value) {
    const item = event.currentTarget;
    const checkbox = item.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;

    updateExcelSelectAllState(columnKey);
}

function updateExcelSelectAllState(columnKey) {
    const selectAllCheckbox = document.getElementById(`select-all-${columnKey}`);
    const allCheckboxes = document.querySelectorAll(`#excel-options-${columnKey} .excel-filter-item:not(.select-all) input[type="checkbox"]`);
    const checkedBoxes = document.querySelectorAll(`#excel-options-${columnKey} .excel-filter-item:not(.select-all) input[type="checkbox"]:checked`);

    if (checkedBoxes.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (checkedBoxes.length === allCheckboxes.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

function selectAllExcelFilter(columnKey) {
    const allCheckboxes = document.querySelectorAll(`#excel-options-${columnKey} input[type="checkbox"]`);
    allCheckboxes.forEach(checkbox => checkbox.checked = true);
}

function clearAllExcelFilter(columnKey) {
    const allCheckboxes = document.querySelectorAll(`#excel-options-${columnKey} input[type="checkbox"]`);
    allCheckboxes.forEach(checkbox => checkbox.checked = false);
}

function filterExcelOptions(columnKey, searchTerm) {
    const items = document.querySelectorAll(`#excel-options-${columnKey} .excel-filter-item:not(.select-all)`);
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm.toLowerCase())) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function applyExcelFilter(columnKey) {
    const checkedItems = document.querySelectorAll(`#excel-options-${columnKey} .excel-filter-item:not(.select-all) input[type="checkbox"]:checked`);
    const selectedValues = Array.from(checkedItems).map(checkbox => {
        return checkbox.parentElement.querySelector('span').textContent;
    });

    if (selectedValues.length === 0) {
        // No items selected, show none
        currentFilters[columnKey] = ['__NONE__'];
    } else {
        // Get all possible values
        const allValues = [...new Set(personalData.map(item => item[columnKey]))];

        if (selectedValues.length === allValues.length) {
            // All items selected, remove filter
            delete currentFilters[columnKey];
        } else {
            // Some items selected
            if (columnKey === 'gatePermissions') {
                currentFilters[columnKey] = [];
                if (selectedValues.includes('アクセス権限あり（0-9）')) {
                    currentFilters[columnKey].push('hasAccess');
                }
                if (selectedValues.includes('アクセス不可（C）')) {
                    currentFilters[columnKey].push('noAccess');
                }
                if (selectedValues.includes('時間制限（R）')) {
                    currentFilters[columnKey].push('restricted');
                }
            } else {
                currentFilters[columnKey] = selectedValues;
            }
        }
    }

    hideAllExcelFilters();
    applyFiltersAndDisplay();
}

// Hide all Excel filter menus
function hideAllExcelFilters() {
    document.querySelectorAll('.excel-filter-menu').forEach(menu => {
        menu.classList.remove('show');
    });
}

// Toggle filter option
function toggleFilterOption(columnKey, value, checked) {
    if (!currentFilters[columnKey]) {
        currentFilters[columnKey] = [];
    }

    if (value === 'all') {
        if (checked) {
            delete currentFilters[columnKey];
        } else {
            currentFilters[columnKey] = [];
        }
        // Update all checkboxes in this filter
        const options = document.querySelectorAll(`#options-${columnKey} input[type="checkbox"]`);
        options.forEach(option => {
            if (option.value !== 'all') {
                option.checked = checked;
            }
        });
    } else {
        if (checked) {
            if (!currentFilters[columnKey].includes(value)) {
                currentFilters[columnKey].push(value);
            }
        } else {
            currentFilters[columnKey] = currentFilters[columnKey].filter(v => v !== value);
        }
    }

    applyFiltersAndDisplay();
}

// Filter dropdown options based on search
function filterDropdownOptions(columnKey, searchTerm) {
    const options = document.querySelectorAll(`#options-${columnKey} .filter-option`);
    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        if (text.includes(searchTerm.toLowerCase())) {
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
        }
    });
}

// Apply filters and display data
function applyFiltersAndDisplay() {
    filteredData = personalData.filter(item => {
        for (const [columnKey, filterValues] of Object.entries(currentFilters)) {
            if (!filterValues || filterValues.length === 0) continue;

            if (columnKey === 'gatePermissions') {
                // Special filtering for gate permissions
                if (filterValues.includes('hasAccess')) {
                    const hasNumericAccess = item.gatePermissions.some(perm => /\d/.test(perm));
                    if (!hasNumericAccess) return false;
                }
                if (filterValues.includes('noAccess')) {
                    const hasNoAccess = item.gatePermissions.some(perm => perm === 'C');
                    if (!hasNoAccess) return false;
                }
            } else {
                if (!filterValues.includes(item[columnKey])) {
                    return false;
                }
            }
        }
        return true;
    });

    updatePagination();
    displayCurrentPage();
    updateFilteredColumnHeaders();
    updateCurrentCountDisplay();
}

// Update filter status display
function updateFilterStatusDisplay() {
    const filterDisplay = document.getElementById('filterStatusDisplay');
    const filterDetails = document.getElementById('filterDetails');

    // Check if elements exist
    if (!filterDisplay || !filterDetails) {
        console.log('フィルタステータス表示要素が見つかりません');
        return;
    }

    if (Object.keys(currentFilters).length === 0) {
        filterDisplay.style.display = 'none';
        return;
    }

    filterDisplay.style.display = 'flex';

    const filterDescriptions = [];
    for (const [columnKey, filterValues] of Object.entries(currentFilters)) {
        if (!filterValues || filterValues.length === 0) continue;

        const columnName = getColumnDisplayName(columnKey);
        if (columnKey === 'gatePermissions') {
            const descriptions = [];
            if (filterValues.includes('hasAccess')) descriptions.push('アクセス可能');
            if (filterValues.includes('noAccess')) descriptions.push('アクセス不可');
            if (filterValues.includes('restricted')) descriptions.push('時間制限');
            filterDescriptions.push(`${columnName}: ${descriptions.join(', ')}`);
        } else {
            filterDescriptions.push(`${columnName}: ${filterValues.join(', ')}`);
        }
    }

    filterDetails.textContent = filterDescriptions.join(' | ');
}

// Update filtered column headers
function updateFilteredColumnHeaders() {
    // Reset all header styles
    document.querySelectorAll('.unified-table th').forEach(th => {
        th.classList.remove('filtered');
        const trigger = th.querySelector('.excel-filter-trigger');
        if (trigger) {
            trigger.classList.remove('active', 'filtered');
        }
    });

    // Mark filtered columns
    for (const columnKey of Object.keys(currentFilters)) {
        const th = document.querySelector(`th[data-column="${columnKey}"]`);
        if (th) {
            th.classList.add('filtered');
            const trigger = th.querySelector('.excel-filter-trigger');
            if (trigger) {
                trigger.classList.add('filtered'); // Add black triangle for filtered state
            }
        }
    }
}

// Update pagination
function updatePagination() {
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Update page info
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
        pageInfo.innerHTML = `${start}-${end} / ${totalItems}件中 (全件数: <span id="totalCount">${personalData.length}</span>件)`;
    }

    // Update filter status display
    updateFilterStatusDisplay();

    // Update pagination buttons
    const pagination = document.getElementById('pagination');
    if (!pagination) {
        console.log('ページネーション要素が見つかりません');
        return;
    }
    pagination.innerHTML = '';

    // Previous button
    const prevButton = document.createElement('li');
    prevButton.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevButton.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage - 1})">前へ</a>`;
    pagination.appendChild(prevButton);

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        const firstPage = document.createElement('li');
        firstPage.className = 'page-item';
        firstPage.innerHTML = '<a class="page-link" href="#" onclick="changePage(1)">1</a>';
        pagination.appendChild(firstPage);

        if (startPage > 2) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'page-item disabled';
            ellipsis.innerHTML = '<span class="page-link">...</span>';
            pagination.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('li');
        pageButton.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageButton.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
        pagination.appendChild(pageButton);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'page-item disabled';
            ellipsis.innerHTML = '<span class="page-link">...</span>';
            pagination.appendChild(ellipsis);
        }

        const lastPage = document.createElement('li');
        lastPage.className = 'page-item';
        lastPage.innerHTML = `<a class="page-link" href="#" onclick="changePage(${totalPages})">${totalPages}</a>`;
        pagination.appendChild(lastPage);
    }

    // Next button
    const nextButton = document.createElement('li');
    nextButton.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextButton.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage + 1})">次へ</a>`;
    pagination.appendChild(nextButton);
}

// Display current page data - シンプル版（statusMonitor方式）
function displayCurrentPage() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);

    const tbody = document.getElementById('personalTableBody');
    if (!tbody) return;

    // シンプルに全削除
    tbody.innerHTML = '';

    pageData.forEach(person => {
        // statusMonitor.createGateCard() と同じ方式
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
                    cellContent = `
                        <input type="checkbox" value="${person.id}"
                               onchange="togglePersonSelection(${person.id}, this.checked)"
                               onclick="event.stopPropagation();">
                    `;
                    break;
                case 'gatePermissions':
                    cellContent = generateGatePermissionsDisplay(person.gatePermissions, person.id);
                    break;
                case 'actions':
                    cellContent = `<span class="text-muted small">
                        ダブルクリック：編集 / 右クリック：履歴
                    </span>`;
                    break;
                default:
                    cellContent = person[columnKey] || '';
                    break;
            }
            rowHTML += `<td>${cellContent}</td>`;
        });

        row.innerHTML = rowHTML;

        // ✅ statusMonitor と同じ「行にだけ付ける」方式

        // ダブルクリック → 編集
        /*
        row.addEventListener('dblclick', (e) => {
            e.preventDefault();
            console.log(`🔥🔥 ${person.name} ダブルクリック → 編集`);
            editPersonRowById(person.id);
        });
        */

        // Ctrl+クリック（または Cmd+クリック）でも編集（フォールバック）
        /*
        row.addEventListener('click', (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                console.log(`⌨️ ${person.name} Ctrl+クリック → 編集`);
                editPersonRowById(person.id);
            }
        });
        */

        // 右クリック → 履歴
        /*
        row.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            console.log(`🔥 ${person.name} 右クリック → 履歴`);
            showHistoryOptionsById(person.id);
        });
        */

        tbody.appendChild(row);
    });

    console.log('✅ 行イベント付与済み: ', pageData.length, '行');
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

// Reset filters
function resetFilters() {
    currentFilters = {};
    hideAllExcelFilters();
    applyFiltersAndDisplay();
}

// Show usage help
function showUsageHelp() {
    const helpModal = document.createElement('div');
    helpModal.className = 'modal fade';
    helpModal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-info-circle text-primary"></i> 
                        テーブル操作方法
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <div class="card h-100">
                                <div class="card-body text-center">
                                    <i class="fas fa-arrows-alt fa-2x text-primary mb-2"></i>
                                    <h6>列の並び替え</h6>
                                    <p class="small">ヘッダーをドラッグ&ドロップして列の順序を変更できます</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <div class="card h-100">
                                <div class="card-body text-center">
                                    <span style="font-size: 2em;">👁</span>
                                    <h6>列の表示切替</h6>
                                    <p class="small">ヘッダー右上の👁アイコンをクリックして列の表示/非表示を切り替えできます</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <div class="card h-100">
                                <div class="card-body text-center">
                                    <i class="fas fa-filter fa-2x text-success mb-2"></i>
                                    <h6>データフィルター</h6>
                                    <p class="small">ヘッダーの▼をクリックしてExcel形式のフィルターを使用できます</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <div class="card h-100">
                                <div class="card-body text-center">
                                    <i class="fas fa-expand-arrows-alt fa-2x text-info mb-2"></i>
                                    <h6>ゲート権限表示</h6>
                                    <p class="small">ゲート権限セルをクリックして詳細を展開できます</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="card h-100">
                                <div class="card-body text-center">
                                    <i class="fas fa-check-square fa-2x text-warning mb-2"></i>
                                    <h6>複数選択</h6>
                                    <p class="small">チェックボックスで複数のレコードを選択して一括操作できます</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">了解しました</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(helpModal);
    const modal = new bootstrap.Modal(helpModal);
    modal.show();

    // Remove modal from DOM when hidden
    helpModal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(helpModal);
    });
}

// Direct table header drag and drop functionality
let draggedColumn = null;
let draggedColumnIndex = null;

function handleDragStart(event) {
    // Make sure we're dragging the th element
    const th = event.target.closest('th');
    if (!th || !th.draggable) return;

    draggedColumn = th;
    draggedColumnIndex = Array.from(th.parentNode.children).indexOf(th);

    th.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', th.dataset.column);

    console.log('Drag started:', th.dataset.column);
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    const th = event.target.closest('th');
    if (th && th !== draggedColumn && th.draggable) {
        // Remove drag-over class from all headers
        document.querySelectorAll('th.drag-over').forEach(header => header.classList.remove('drag-over'));
        th.classList.add('drag-over');
    }
}

function handleDrop(event) {
    event.preventDefault();

    const targetTh = event.target.closest('th');
    if (!targetTh || !draggedColumn || targetTh === draggedColumn) {
        cleanupDragState();
        return;
    }

    console.log('Drop on:', targetTh.dataset.column);

    const targetIndex = Array.from(targetTh.parentNode.children).indexOf(targetTh);
    const draggedColumnKey = draggedColumn.dataset.column;
    const targetColumnKey = targetTh.dataset.column;

    // Update column order array
    const draggedOrderIndex = columnOrder.indexOf(draggedColumnKey);
    const targetOrderIndex = columnOrder.indexOf(targetColumnKey);

    if (draggedOrderIndex !== -1 && targetOrderIndex !== -1) {
        // Remove from old position and insert at new position
        columnOrder.splice(draggedOrderIndex, 1);
        const newTargetIndex = targetOrderIndex > draggedOrderIndex ? targetOrderIndex - 1 : targetOrderIndex;
        columnOrder.splice(newTargetIndex, 0, draggedColumnKey);

        console.log('New column order:', columnOrder);

        // Rebuild the entire table with new order
        rebuildTableWithNewOrder();

        // Show feedback
        showColumnReorderFeedback(draggedColumnKey, targetColumnKey);
    }

    cleanupDragState();
}

function handleDragEnd(event) {
    cleanupDragState();
}

function cleanupDragState() {
    if (draggedColumn) {
        draggedColumn.classList.remove('dragging');
    }
    document.querySelectorAll('th.drag-over').forEach(th => th.classList.remove('drag-over'));
    draggedColumn = null;
    draggedColumnIndex = null;
}

function rebuildTableWithNewOrder() {
    // Update table headers
    updateTableHeaders();

    // Redisplay current page data with new column order
    displayCurrentPage();
}

function updateTableHeaders() {
    const thead = document.querySelector('#personalTable thead tr');
    const columnDefinitions = {
        'select': {
            title: '<input type="checkbox" id="selectAll" onchange="toggleSelectAll()">',
            draggable: false
        },
        'personalSend': {
            title: '個人送信',
            draggable: true
        },
        'registrationStatus': {
            title: '登録状態',
            draggable: true
        },
        'personalCode': {
            title: '個人コード',
            draggable: true
        },
        'managementNumber': {
            title: '管理番号',
            draggable: true
        },
        'name': {
            title: '氏名',
            draggable: true
        },
        'katakana': {
            title: 'カタカナ',
            draggable: true
        },
        'tenantNumber': {
            title: 'テナント番号',
            draggable: true
        },
        'departmentCode': {
            title: '所属コード',
            draggable: true
        },
        'kubunCode': {
            title: '区分コード',
            draggable: true
        },
        'tumonCode': {
            title: '通門コード',
            draggable: true
        },
        'gatePermissions': {
            title: 'ゲート権限 (1-10)',
            draggable: true
        },
        'actions': {
            title: '操作',
            draggable: false
        }
    };

    // Clear and rebuild headers
    thead.innerHTML = '';

    columnOrder.forEach(columnKey => {
        if (hiddenColumns.includes(columnKey)) return;

        const def = columnDefinitions[columnKey];
        if (!def) return;

        const th = document.createElement('th');
        th.setAttribute('data-column', columnKey);

        if (def.draggable) {
            th.setAttribute('draggable', 'true');
            th.addEventListener('dragstart', handleDragStart);
            th.addEventListener('dragover', handleDragOver);
            th.addEventListener('drop', handleDrop);
            th.addEventListener('dragend', handleDragEnd);

            th.innerHTML = `
                <span class="column-visibility-toggle" onclick="toggleColumnVisibilityDirect('${columnKey}', event)" title="列表示切替">×</span>
                ${def.title}
                <div class="excel-filter-trigger" onclick="showExcelFilter(event, '${columnKey}')"></div>
                <div class="excel-filter-menu" id="excel-filter-${columnKey}"></div>
            `;
        } else {
            th.innerHTML = def.title;
        }

        thead.appendChild(th);
    });
}

// Separate function to avoid conflicts with existing toggleColumnVisibility
function toggleColumnVisibilityDirect(columnKey, event) {
    event.stopPropagation(); // Prevent drag from starting

    const isCurrentlyHidden = hiddenColumns.includes(columnKey);

    if (isCurrentlyHidden) {
        // Show column
        hiddenColumns = hiddenColumns.filter(col => col !== columnKey);
        showColumnVisibilityFeedback(columnKey, true);
    } else {
        // Hide column  
        hiddenColumns.push(columnKey);
        showColumnVisibilityFeedback(columnKey, false);
    }

    // Update badge count
    updateHiddenColumnsBadge();

    // Rebuild table with new visibility settings
    rebuildTableWithNewOrder();
}

// Show column manager modal
function showColumnManager() {
    populateColumnManager();
    const modal = new bootstrap.Modal(document.getElementById('columnManagerModal'));
    modal.show();
}

// Populate column manager with current state
function populateColumnManager() {
    const visibleList = document.getElementById('visibleColumnsList');
    const hiddenList = document.getElementById('hiddenColumnsList');
    const noHiddenMsg = document.getElementById('noHiddenColumns');

    const columnDefinitions = {
        'select': '選択',
        'personalSend': '個人送信',
        'registrationStatus': '登録状態',
        'personalCode': '個人コード',
        'managementNumber': '管理番号',
        'name': '氏名',
        'katakana': 'カタカナ',
        'tenantNumber': 'テナント番号',
        'departmentCode': '所属コード',
        'kubunCode': '区分コード',
        'tumonCode': '通門コード',
        'gatePermissions': 'ゲート権限 (1-10)',
        'actions': '操作'
    };

    // Clear lists
    visibleList.innerHTML = '';
    hiddenList.innerHTML = '';

    // Populate visible columns
    columnOrder.forEach(columnKey => {
        if (!hiddenColumns.includes(columnKey) && columnDefinitions[columnKey]) {
            const item = createColumnManagerItem(columnKey, columnDefinitions[columnKey], false);
            visibleList.appendChild(item);
        }
    });

    // Populate hidden columns
    hiddenColumns.forEach(columnKey => {
        if (columnDefinitions[columnKey]) {
            const item = createColumnManagerItem(columnKey, columnDefinitions[columnKey], true);
            hiddenList.appendChild(item);
        }
    });

    // Show/hide "no hidden columns" message
    if (hiddenColumns.length === 0) {
        noHiddenMsg.style.display = 'block';
    } else {
        noHiddenMsg.style.display = 'none';
    }
}

// Create column manager item
function createColumnManagerItem(columnKey, displayName, isHidden) {
    const item = document.createElement('div');
    item.className = `column-item-manager ${isHidden ? 'hidden' : ''}`;
    item.innerHTML = `
        <span class="column-name">${displayName}</span>
        <button class="column-toggle-btn" onclick="toggleColumnFromManager('${columnKey}')" title="${isHidden ? '表示する' : '非表示にする'}">
            <i class="fas ${isHidden ? 'fa-plus' : 'fa-times'}"></i>
        </button>
    `;
    return item;
}

// Toggle column visibility from manager
function toggleColumnFromManager(columnKey) {
    const isCurrentlyHidden = hiddenColumns.includes(columnKey);

    if (isCurrentlyHidden) {
        // Show column
        hiddenColumns = hiddenColumns.filter(col => col !== columnKey);
        showColumnVisibilityFeedback(columnKey, true);
    } else {
        // Hide column
        hiddenColumns.push(columnKey);
        showColumnVisibilityFeedback(columnKey, false);
    }

    // Update badge count
    updateHiddenColumnsBadge();

    // Rebuild table
    rebuildTableWithNewOrder();

    // Refresh manager display
    populateColumnManager();
}

// Show all columns
function showAllColumns() {
    const previousHiddenCount = hiddenColumns.length;
    hiddenColumns = [];

    // Update badge
    updateHiddenColumnsBadge();

    // Rebuild table
    rebuildTableWithNewOrder();

    // Refresh manager display
    populateColumnManager();

    // Show feedback
    if (previousHiddenCount > 0) {
        showColumnVisibilityFeedback(`${previousHiddenCount}個の列`, true);
    }
}

// Reset to default column settings
function resetToDefault() {
    const defaultOrder = ['select', 'personalSend', 'registrationStatus', 'personalCode', 'managementNumber', 'name', 'katakana', 'tenantNumber', 'departmentCode', 'kubunCode', 'gatePermissions', 'actions'];
    const defaultHidden = [];

    columnOrder = [...defaultOrder];
    hiddenColumns = [...defaultHidden];

    // Update badge
    updateHiddenColumnsBadge();

    // Rebuild table
    rebuildTableWithNewOrder();

    // Refresh manager display
    populateColumnManager();

    // Show feedback
    const feedback = document.createElement('div');
    feedback.className = 'alert alert-success position-fixed';
    feedback.style.cssText = 'top: 20px; right: 20px; z-index: 9999; opacity: 0; transition: opacity 0.3s ease;';
    feedback.innerHTML = '<i class="fas fa-undo"></i> 列設定をデフォルトに戻しました';

    document.body.appendChild(feedback);
    setTimeout(() => feedback.style.opacity = '1', 10);
    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => document.body.removeChild(feedback), 300);
    }, 2000);
}

// Update hidden columns badge
function updateHiddenColumnsBadge() {
    const badge = document.getElementById('hiddenColumnsBadge');
    const count = hiddenColumns.length;

    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline';
    } else {
        badge.style.display = 'none';
    }
}

function showColumnReorderFeedback(draggedColumn, targetColumn) {
    const feedback = document.createElement('div');
    feedback.className = 'alert alert-info position-fixed';
    feedback.style.cssText = 'top: 20px; right: 20px; z-index: 9999; opacity: 0; transition: opacity 0.3s ease;';
    feedback.innerHTML = `<i class="fas fa-arrows-alt"></i> 「${getColumnDisplayName(draggedColumn)}」を「${getColumnDisplayName(targetColumn)}」の位置に移動しました`;

    document.body.appendChild(feedback);

    // Animate in
    setTimeout(() => feedback.style.opacity = '1', 10);

    // Remove after 3 seconds
    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => document.body.removeChild(feedback), 300);
    }, 3000);
}

function getColumnDisplayName(columnKey) {
    const names = {
        'select': '選択',
        'personalSend': '個人送信',
        'registrationStatus': '登録状態',
        'personalCode': '個人コード',
        'managementNumber': '管理番号',
        'name': '氏名',
        'katakana': 'カタカナ',
        'tenantNumber': 'テナント番号',
        'departmentCode': '所属コード',
        'kubunCode': '区分コード',
        'tumonCode': '通門コード',
        'gatePermissions': 'ゲート権限 (1-10)',
        'actions': '操作'
    };
    return names[columnKey] || columnKey;
}

// Direct column visibility toggle
function toggleColumnVisibility(columnKey, event) {
    event.stopPropagation(); // Prevent drag from starting

    const columnHeader = document.querySelector(`th[data-column="${columnKey}"]`);
    const columnIndex = Array.from(columnHeader.parentNode.children).indexOf(columnHeader);

    if (hiddenColumns.includes(columnKey)) {
        // Show column
        hiddenColumns = hiddenColumns.filter(col => col !== columnKey);
        columnHeader.style.display = '';

        // Show corresponding cells in all rows
        document.querySelectorAll('#personalTableBody tr').forEach(row => {
            if (row.children[columnIndex]) {
                row.children[columnIndex].style.display = '';
            }
        });

        // Update toggle appearance
        const toggle = columnHeader.querySelector('.column-visibility-toggle');
        toggle.textContent = '👁';
        toggle.classList.remove('hidden');
        toggle.title = '列を非表示';

        showColumnVisibilityFeedback(columnKey, true);
    } else {
        // Hide column
        hiddenColumns.push(columnKey);
        columnHeader.style.display = 'none';

        // Hide corresponding cells in all rows
        document.querySelectorAll('#personalTableBody tr').forEach(row => {
            if (row.children[columnIndex]) {
                row.children[columnIndex].style.display = 'none';
            }
        });

        showColumnVisibilityFeedback(columnKey, false);
    }
}

function showColumnVisibilityFeedback(columnKey, visible) {
    const action = visible ? '表示' : '非表示';
    const icon = visible ? 'fas fa-eye' : 'fas fa-eye-slash';

    const feedback = document.createElement('div');
    feedback.className = `alert ${visible ? 'alert-success' : 'alert-warning'} position-fixed`;
    feedback.style.cssText = 'top: 20px; right: 20px; z-index: 9999; opacity: 0; transition: opacity 0.3s ease;';
    feedback.innerHTML = `<i class="${icon}"></i> 「${getColumnDisplayName(columnKey)}」を${action}にしました`;

    document.body.appendChild(feedback);

    // Animate in
    setTimeout(() => feedback.style.opacity = '1', 10);

    // Remove after 2 seconds
    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => document.body.removeChild(feedback), 300);
    }, 2000);
}

// Operation status message functions
function showOperationStatus(message, type = 'success', autoHide = true) {
    const statusArea = document.getElementById('operationStatusArea');
    if (!statusArea) return;

    // Create status message element
    const statusMessage = document.createElement('div');
    statusMessage.className = `operation-status-message ${type}`;

    const iconMap = {
        'success': 'fas fa-check-circle',
        'info': 'fas fa-info-circle',
        'warning': 'fas fa-exclamation-triangle'
    };

    const currentTime = new Date().toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    statusMessage.innerHTML = `
        <div class="status-message-content">
            <i class="${iconMap[type]}"></i>
            <div class="status-message-text">${message}</div>
            <div class="status-message-time">${currentTime}</div>
        </div>
        <button class="status-message-close" onclick="removeOperationStatus(this.parentElement)">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Show status area and add message
    statusArea.style.display = 'block';
    statusArea.appendChild(statusMessage);

    // Auto hide after 5 seconds if specified
    if (autoHide) {
        setTimeout(() => {
            removeOperationStatus(statusMessage);
        }, 5000);
    }

    // Scroll to show the message
    statusMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function removeOperationStatus(messageElement) {
    const statusArea = document.getElementById('operationStatusArea');

    if (messageElement && messageElement.parentNode) {
        messageElement.style.animation = 'slideOutUp 0.3s ease-out';
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);

                // Hide status area if no messages left
                if (statusArea && statusArea.children.length === 0) {
                    statusArea.style.display = 'none';
                }
            }
        }, 300);
    }
}

// Action button functions
function addNewPerson() {
    showOperationStatus('新規個人登録画面に遷移しています...', 'info');
    setTimeout(() => {
        showOperationStatus('新規個人登録が完了しました。', 'success');
        // Simulate adding a new person
        const newPerson = {
            id: personalData.length + 1,
            personalSend: '未送信',
            registrationStatus: '登録中',
            personalCode: `kojin${String(personalData.length + 1).padStart(4, '0')}`,
            managementNumber: `no${String(personalData.length + 1).padStart(4, '0')}`,
            name: '新規 太郎',
            katakana: 'シンキ タロウ',
            tenantNumber: `tenant${String(personalData.length + 1).padStart(3, '0')}`,
            departmentCode: `shozoku${String(personalData.length + 1).padStart(3, '0')}`,
            kubunCode: `kubun${String(personalData.length + 1).padStart(3, '0')}`,
            tumonCode: `tumon${String(personalData.length + 1).padStart(3, '0')}`,
            gatePermissions: generateGatePermissions(),
            selected: false
        };
        personalData.push(newPerson);
        applyFiltersAndDisplay();
    }, 1000);
}

function editPerson() {
    const selectedPeople = personalData.filter(p => p.selected);
    if (selectedPeople.length === 0) {
        alert('編集する個人を選択してください');
        return;
    }
    if (selectedPeople.length > 1) {
        alert('編集は1件ずつ行ってください');
        return;
    }
    alert(`${selectedPeople[0].name}の編集画面に遷移します`);
}

function bulkDelete() {
    const selectedPeople = personalData.filter(p => p.selected);
    if (selectedPeople.length === 0) {
        alert('削除する個人を選択してください');
        return;
    }
    if (confirm(`選択された${selectedPeople.length}件のデータを削除しますか？`)) {
        showOperationStatus(`${selectedPeople.length}件のデータを削除しています...`, 'info');

        setTimeout(() => {
            personalData = personalData.filter(p => !p.selected);
            applyFiltersAndDisplay();
            showOperationStatus(`${selectedPeople.length}件のデータ削除が完了しました。`, 'success');
        }, 800);
    }
}

function bulkErase() {
    const selectedPeople = personalData.filter(p => p.selected);
    if (selectedPeople.length === 0) {
        alert('消去する個人を選択してください');
        return;
    }
    if (confirm(`選択された${selectedPeople.length}件のデータを完全に消去しますか？\n\n※この操作は元に戻せません`)) {
        showOperationStatus(`${selectedPeople.length}件のデータを消去しています...`, 'warning');

        setTimeout(() => {
            // 消去は削除より強力な処理として、選択解除も行う
            personalData = personalData.filter(p => !p.selected);
            applyFiltersAndDisplay();
            showOperationStatus(`${selectedPeople.length}件のデータ消去が完了しました。`, 'success');
        }, 1000);
    }
}

function uploadData() {
    alert('データアップロード機能');
}

function downloadData() {
    alert('データダウンロード機能');
}

function editDepartment() {
    alert('所属編集画面に遷移します');
}

function editCategory() {
    alert('区分編集画面に遷移します');
}

function editTimeRestriction() {
    alert('入退制限時間帯編集画面に遷移します');
}

// New functions for No.1
function sendPersonalData() {
    const selectedPeople = personalData.filter(p => p.selected);
    if (selectedPeople.length === 0) {
        alert('送信する個人を選択してください');
        return;
    }
    if (confirm(`選択された${selectedPeople.length}件のデータを送信しますか？`)) {
        showOperationStatus(`${selectedPeople.length}件のデータを送信しています...`, 'info');

        setTimeout(() => {
            // Mark as sent
            selectedPeople.forEach(person => {
                person.personalSend = '送信済';
            });
            applyFiltersAndDisplay();
            showOperationStatus(`${selectedPeople.length}件のデータ送信が完了しました。`, 'success');
        }, 1200);
    }
}

function manageTimeRestrictions() {
    alert('入退室時間帯の管理画面に遷移します');
}

function bulkChangeGatePermissions() {
    const selectedPeople = personalData.filter(p => p.selected);
    if (selectedPeople.length === 0) {
        alert('通門権限を変更する個人を選択してください');
        return;
    }

    // Create and show modal for bulk gate permission change
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'bulkGatePermissionModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-users-cog text-warning"></i>
                        通門権限の一括変更 (${selectedPeople.length}件選択中)
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i>
                        選択された${selectedPeople.length}件の個人データの通門権限を一括で変更します。
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <h6>変更対象ゲート</h6>
                            <div class="gate-selection-grid">
                                ${Array.from({ length: 10 }, (_, i) => `
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="gate${i + 1}" value="gate${i + 1}">
                                        <label class="form-check-label" for="gate${i + 1}">
                                            ゲート ${String(i + 1).padStart(2, '0')}
                                        </label>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="mt-2">
                                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="selectAllGates()">すべて選択</button>
                                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="clearAllGates()">すべてクリア</button>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6>変更する権限</h6>
                            <div class="permission-options">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="permissionType" id="accessLevel" value="access">
                                    <label class="form-check-label" for="accessLevel">
                                        <span class="permission-indicator access"></span>
                                        アクセス可能 (レベル指定)
                                    </label>
                                </div>
                                <div class="ms-4 mb-2">
                                    <select class="form-select form-select-sm" id="accessLevelSelect" disabled>
                                        ${Array.from({ length: 10 }, (_, i) => `<option value="${i}">レベル ${i}</option>`).join('')}
                                    </select>
                                </div>
                                
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="permissionType" id="noAccess" value="no-access">
                                    <label class="form-check-label" for="noAccess">
                                        <span class="permission-indicator no-access"></span>
                                        アクセス不可 (C)
                                    </label>
                                </div>
                                
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="permissionType" id="restricted" value="restricted">
                                    <label class="form-check-label" for="restricted">
                                        <span class="permission-indicator restricted"></span>
                                        時間制限 (R)
                                    </label>
                                </div>
                                
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="permissionType" id="clearPermission" value="none">
                                    <label class="form-check-label" for="clearPermission">
                                        <span class="permission-indicator none"></span>
                                        権限クリア (-)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-3 p-2 bg-light rounded">
                        <small class="text-muted">
                            <strong>注意:</strong> この操作により、選択されたゲートの権限が上記で指定した内容に変更されます。元の設定は失われますのでご注意ください。
                        </small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                    <button type="button" class="btn btn-warning" onclick="executeBulkGatePermissionChange()">
                        <i class="fas fa-users-cog"></i> 一括変更実行
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    // Setup event listeners for the modal
    setupBulkPermissionModalEvents();

    // Remove modal from DOM when hidden
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function printData() {
    alert('印刷機能');
}

function exportData() {
    alert('データ出力機能');
}


// Resize functionality for Excel filter
let isResizing = false;
let currentResizeTarget = null;
let startY = 0;
let startHeight = 0;

function startResize(event, columnKey) {
    event.preventDefault();
    event.stopPropagation();

    isResizing = true;
    currentResizeTarget = document.getElementById(`excel-options-${columnKey}`);
    startY = event.clientY;
    startHeight = currentResizeTarget.offsetHeight;

    // Add global event listeners
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);

    // Change cursor for the entire document
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
}

function handleResize(event) {
    if (!isResizing || !currentResizeTarget) return;

    event.preventDefault();

    const deltaY = event.clientY - startY;
    const newHeight = startHeight + deltaY;

    // Set minimum and maximum heights
    const minHeight = 120;
    const maxHeight = 400;

    if (newHeight >= minHeight && newHeight <= maxHeight) {
        currentResizeTarget.style.height = newHeight + 'px';
    }
}

function stopResize(event) {
    if (!isResizing) return;

    isResizing = false;
    currentResizeTarget = null;

    // Remove global event listeners
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);

    // Reset cursor
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
}

// Bulk gate permission functions
function setupBulkPermissionModalEvents() {
    // Enable/disable access level select based on radio button
    document.querySelectorAll('input[name="permissionType"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const accessLevelSelect = document.getElementById('accessLevelSelect');
            if (this.value === 'access') {
                accessLevelSelect.disabled = false;
            } else {
                accessLevelSelect.disabled = true;
            }
        });
    });
}

function selectAllGates() {
    document.querySelectorAll('#bulkGatePermissionModal input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
    });
}

function clearAllGates() {
    document.querySelectorAll('#bulkGatePermissionModal input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}

function executeBulkGatePermissionChange() {
    // Get selected gates
    const selectedGates = [];
    document.querySelectorAll('#bulkGatePermissionModal input[type="checkbox"]:checked').forEach(checkbox => {
        const gateNumber = parseInt(checkbox.value.replace('gate', '')) - 1;
        selectedGates.push(gateNumber);
    });

    if (selectedGates.length === 0) {
        alert('変更対象のゲートを選択してください');
        return;
    }

    // Get selected permission type
    const selectedPermission = document.querySelector('input[name="permissionType"]:checked');
    if (!selectedPermission) {
        alert('変更する権限を選択してください');
        return;
    }

    let newPermissionValue = '';
    switch (selectedPermission.value) {
        case 'access':
            const accessLevel = document.getElementById('accessLevelSelect').value;
            newPermissionValue = accessLevel;
            break;
        case 'no-access':
            newPermissionValue = 'C';
            break;
        case 'restricted':
            newPermissionValue = 'R';
            break;
        case 'none':
            newPermissionValue = '-';
            break;
    }

    // Confirm action
    const selectedPeople = personalData.filter(p => p.selected);
    const permissionDescription = getPermissionDescription(newPermissionValue);
    const message = `以下の設定で${selectedPeople.length}件の通門権限を変更しますか？\n\n` +
        `対象ゲート: ${selectedGates.map(g => `G${String(g + 1).padStart(2, '0')}`).join(', ')}\n` +
        `権限設定: ${permissionDescription}\n\n` +
        `※この操作は元に戻せません`;

    if (!confirm(message)) {
        return;
    }

    // Execute bulk change
    selectedPeople.forEach(person => {
        selectedGates.forEach(gateIndex => {
            person.gatePermissions[gateIndex] = newPermissionValue;
        });
    });

    // Refresh display
    applyFiltersAndDisplay();

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('bulkGatePermissionModal'));
    modal.hide();

    // Show success message
    showSuccessMessage(`${selectedPeople.length}件の通門権限を一括変更しました`);
}

function showSuccessMessage(message) {
    const feedback = document.createElement('div');
    feedback.className = 'alert alert-success position-fixed';
    feedback.style.cssText = 'top: 20px; right: 20px; z-index: 9999; opacity: 0; transition: opacity 0.3s ease;';
    feedback.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;

    document.body.appendChild(feedback);

    // Animate in
    setTimeout(() => feedback.style.opacity = '1', 10);

    // Remove after 3 seconds
    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => document.body.removeChild(feedback), 300);
    }, 3000);
}

// Update current count display
function updateCurrentCountDisplay() {
    const countElement = document.getElementById('currentCountValue');
    if (countElement) {
        countElement.textContent = filteredData.length.toLocaleString();
    }
}

// Show temporary assignment modal
function showTemporaryAssignment() {
    if (filteredData.length === 0) {
        alert('表示対象のデータがありません');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'temporaryAssignmentModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-clipboard-list text-info"></i>
                        仮配置 - 現条件での人数: ${filteredData.length.toLocaleString()}人
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i>
                        現在のフィルター条件に該当する${filteredData.length.toLocaleString()}件のデータが表示されています。
                        この画面では実際の登録は行われず、条件確認のみとなります。
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <strong>対象データ一覧</strong>
                            ${Object.keys(currentFilters).length > 0 ?
            `<span class="badge bg-primary ms-2">フィルター適用中</span>` :
            `<span class="badge bg-secondary ms-2">全データ</span>`
        }
                        </div>
                        <div>
                            <button class="btn btn-outline-primary btn-sm" onclick="exportTemporaryList()">
                                <i class="fas fa-download"></i> リスト出力
                            </button>
                        </div>
                    </div>
                    
                    <div class="table-responsive" style="max-height: 400px;">
                        <table class="table table-sm table-striped">
                            <thead class="table-dark sticky-top">
                                <tr>
                                    <th>個人コード</th>
                                    <th>氏名</th>
                                    <th>カタカナ</th>
                                    <th>所属コード</th>
                                    <th>区分コード</th>
                                    <th>送信状態</th>
                                    <th>登録状態</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filteredData.map(person => `
                                    <tr>
                                        <td>${person.personalCode}</td>
                                        <td>${person.name}</td>
                                        <td>${person.katakana}</td>
                                        <td>${person.departmentCode}</td>
                                        <td>${person.kubunCode}</td>
                                        <td>
                                            <span class="badge ${person.personalSend === '送信済' ? 'bg-success' : 'bg-warning'}">
                                                ${person.personalSend}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="badge ${person.registrationStatus === '登録完了' ? 'bg-success' : 'bg-info'}">
                                                ${person.registrationStatus}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    ${Object.keys(currentFilters).length > 0 ? `
                        <div class="mt-3 p-2 bg-light rounded">
                            <small><strong>適用中のフィルター:</strong></small>
                            <div class="d-flex flex-wrap gap-1 mt-1">
                                ${Object.entries(currentFilters).map(([key, values]) => `
                                    <span class="badge bg-primary">${getColumnDisplayName(key)}: ${Array.isArray(values) ? values.join(', ') : values}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                    <button type="button" class="btn btn-primary" onclick="proceedWithCurrentData()">
                        <i class="fas fa-arrow-right"></i> この条件で続行
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    // Remove modal from DOM when hidden
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function exportTemporaryList() {
    alert('仮配置リストの出力機能（CSV/Excel形式での出力）');
}

function proceedWithCurrentData() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('temporaryAssignmentModal'));
    modal.hide();
    alert(`${filteredData.length.toLocaleString()}件のデータで処理を続行します`);
}

// Navigate to report with confirmation
function navigateToReport(event) {
    event.preventDefault();

    // Check if there are unsaved changes or selections
    const selectedPeople = personalData.filter(p => p.selected);
    const hasFilters = Object.keys(currentFilters).length > 0;
    const hasUnsavedChanges = selectedPeople.length > 0 || hasFilters;

    let message = '報告書画面に遷移します。';
    let warningItems = [];

    if (selectedPeople.length > 0) {
        warningItems.push(`選択中のデータ: ${selectedPeople.length}件`);
    }

    if (hasFilters) {
        warningItems.push('適用中のフィルター条件');
    }

    if (warningItems.length > 0) {
        message += '\n\n以下の設定は失われます:\n• ' + warningItems.join('\n• ');
        message += '\n\n本当に遷移しますか？';
    } else {
        message += '\n\n本当に遷移しますか？';
    }

    // Show confirmation modal instead of alert for better UX
    showReportNavigationConfirmation(message, hasUnsavedChanges, selectedPeople.length, hasFilters);
}

function showReportNavigationConfirmation(message, hasUnsavedChanges, selectedCount, hasFilters) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'reportNavigationModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-file-alt text-primary"></i>
                        報告書画面への遷移確認
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="alert ${hasUnsavedChanges ? 'alert-warning' : 'alert-info'}">
                        <i class="fas ${hasUnsavedChanges ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
                        報告書画面に遷移します。
                    </div>
                    
                    ${hasUnsavedChanges ? `
                        <div class="alert alert-danger">
                            <strong><i class="fas fa-warning"></i> 注意</strong><br>
                            現在の画面の以下の設定は失われます：
                            <ul class="mb-0 mt-2">
                                ${selectedCount > 0 ? `<li>選択中のデータ: <strong>${selectedCount}件</strong></li>` : ''}
                                ${hasFilters ? `<li>適用中のフィルター条件</li>` : ''}
                            </ul>
                        </div>
                        
                        <div class="mb-3">
                            <h6>現在の状況を保存しますか？</h6>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="saveCurrentState">
                                <label class="form-check-label" for="saveCurrentState">
                                    現在の選択状態とフィルター条件を一時保存する
                                    <small class="text-muted d-block">（次回個人一覧画面を開いたときに復元されます）</small>
                                </label>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="bg-light p-3 rounded">
                        <h6><i class="fas fa-file-alt"></i> 報告書画面について</h6>
                        <p class="mb-0 small text-muted">
                            報告書画面では入退室履歴レポートの作成・出力が可能です。
                            個人一覧画面の情報は報告書画面では参照されません。
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times"></i> キャンセル
                    </button>
                    <button type="button" class="btn btn-primary" onclick="executeReportNavigation()">
                        <i class="fas fa-arrow-right"></i> 報告書画面に遷移
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    // Remove modal from DOM when hidden
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function executeReportNavigation() {
    const saveState = document.getElementById('saveCurrentState');

    if (saveState && saveState.checked) {
        // Save current state to localStorage
        const currentState = {
            selectedIds: personalData.filter(p => p.selected).map(p => p.id),
            filters: currentFilters,
            timestamp: Date.now()
        };
        localStorage.setItem('personalListState', JSON.stringify(currentState));
        showSuccessMessage('現在の状態を保存しました');
    }

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('reportNavigationModal'));
    modal.hide();

    // Navigate to report page
    setTimeout(() => {
        window.location.href = '/report';
    }, 500);
}

// Context menu functionality
function showContextMenu(event, person) {
    const contextMenu = document.getElementById('contextMenu');

    // Clear previous highlights
    document.querySelectorAll('.row-highlight').forEach(row => {
        row.classList.remove('row-highlight');
    });

    // Highlight the clicked row
    event.currentTarget.classList.add('row-highlight');

    // Populate context menu
    contextMenu.innerHTML = `
        <div class="context-menu-header">
            <i class="fas fa-user"></i>
            ${person.name} (${person.personalCode})
        </div>
        <div class="context-menu-item primary" onclick="editPersonRowById(${person.id})">
            <i class="fas fa-edit"></i>
            <span>編集</span>
        </div>
        <div class="context-menu-item" onclick="showHistoryOptionsById(${person.id})">
            <i class="fas fa-history"></i>
            <span>履歴表示</span>
        </div>
        <div class="context-menu-item" onclick="duplicatePersonById(${person.id})">
            <i class="fas fa-copy"></i>
            <span>複製</span>
        </div>
        <div class="context-menu-item danger" onclick="deletePerson(${person.id})">
            <i class="fas fa-trash"></i>
            <span>削除</span>
        </div>
    `;

    // Position the context menu
    const rect = contextMenu.getBoundingClientRect();
    let x = event.clientX;
    let y = event.clientY;

    // Adjust position to keep menu within viewport
    if (x + 220 > window.innerWidth) {
        x = window.innerWidth - 220;
    }
    if (y + 200 > window.innerHeight) {
        y = window.innerHeight - 200;
    }

    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.style.display = 'block';

    // Add global click listener to close menu
    setTimeout(() => {
        document.addEventListener('click', hideContextMenu, { once: true });
    }, 10);
}

function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'none';

    // Remove row highlighting
    document.querySelectorAll('.row-highlight').forEach(row => {
        row.classList.remove('row-highlight');
    });
}

function editPersonRow(person) {
    hideContextMenu();
    showOperationStatus(`${person.name}の編集画面に遷移しています...`, 'info');
    setTimeout(() => {
        alert(`${person.name}の編集画面を開きます\n\n個人コード: ${person.personalCode}\n氏名: ${person.name}`);
    }, 500);
}

function editPersonRowById(personId) {
    const person = personalData.find(p => p.id === personId);
    if (person) {
        editPersonRow(person);
    }
}

function showHistoryOptionsById(personId) {
    const person = personalData.find(p => p.id === personId);
    if (person) {
        showHistoryOptions(person);
    }
}

function duplicatePersonById(personId) {
    const person = personalData.find(p => p.id === personId);
    if (person) {
        duplicatePerson(person);
    }
}

function showHistoryOptions(person) {
    hideContextMenu();

    // Create history options modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'historyOptionsModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-history text-info"></i>
                        履歴表示設定
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="fas fa-user"></i>
                        <strong>${person.name}</strong> (${person.personalCode}) の履歴を表示します
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <h6><i class="fas fa-calendar"></i> 期間選択</h6>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="historyPeriod" id="today" value="today" checked>
                                <label class="form-check-label" for="today">当日</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="historyPeriod" id="yesterday" value="yesterday">
                                <label class="form-check-label" for="yesterday">前日～</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="historyPeriod" id="week" value="week">
                                <label class="form-check-label" for="week">1週間前～</label>
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
                    <button type="button" class="btn btn-primary" onclick="executeHistoryView('${person.personalCode}', '${person.name}')">
                        <i class="fas fa-arrow-right"></i> 履歴画面へ遷移
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    // Remove modal from DOM when hidden
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function executeHistoryView(personalCode, personName) {
    const period = document.querySelector('input[name="historyPeriod"]:checked').value;
    const historyTypes = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        historyTypes.push(checkbox.value);
    });

    const modal = bootstrap.Modal.getInstance(document.getElementById('historyOptionsModal'));
    modal.hide();

    const periodText = {
        'today': '当日',
        'yesterday': '前日～',
        'week': '1週間前～'
    }[period];

    showOperationStatus(`${personName}の履歴画面に遷移しています... (期間: ${periodText})`, 'info');

    setTimeout(() => {
        alert(`履歴画面に遷移します\n\n対象者: ${personName} (${personalCode})\n期間: ${periodText}\n履歴種類: ${historyTypes.join(', ')}`);
    }, 800);
}

function duplicatePerson(person) {
    hideContextMenu();

    if (confirm(`${person.name}のデータを複製しますか？`)) {
        showOperationStatus(`${person.name}のデータを複製しています...`, 'info');

        setTimeout(() => {
            const newPerson = {
                ...person,
                id: personalData.length + 1,
                personalCode: `${person.personalCode}_copy`,
                name: `${person.name}（複製）`,
                personalSend: '未送信',
                registrationStatus: '登録中',
                selected: false
            };

            personalData.push(newPerson);
            applyFiltersAndDisplay();
            showOperationStatus(`${person.name}のデータ複製が完了しました`, 'success');
        }, 1000);
    }
}

function deletePerson(personId) {
    hideContextMenu();

    const person = personalData.find(p => p.id === personId);
    if (!person) return;

    if (confirm(`${person.name}のデータを削除しますか？\n\n※この操作は元に戻せません`)) {
        showOperationStatus(`${person.name}のデータを削除しています...`, 'info');

        setTimeout(() => {
            personalData = personalData.filter(p => p.id !== personId);
            applyFiltersAndDisplay();
            showOperationStatus(`${person.name}のデータ削除が完了しました`, 'success');
        }, 800);
    }
}

// Show Person Edit Modal
function showPersonEditModal(personId, personName) {
    const person = personalData.find(p => p.id === personId);
    if (!person) return;

    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'personEditModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-user-edit text-primary"></i>
                        個人データ編集: ${person.name}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="personEditForm">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">個人コード</label>
                                <input type="text" class="form-control" name="personalCode" value="${person.personalCode}" readonly>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">管理番号</label>
                                <input type="text" class="form-control" name="managementNumber" value="${person.managementNumber}">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">氏名</label>
                                <input type="text" class="form-control" name="name" value="${person.name}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">フリガナ</label>
                                <input type="text" class="form-control" name="katakana" value="${person.katakana}">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">所属コード</label>
                                <input type="text" class="form-control" name="departmentCode" value="${person.departmentCode}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">区分コード</label>
                                <input type="text" class="form-control" name="kubunCode" value="${person.kubunCode}">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">テナント番号</label>
                                <input type="text" class="form-control" name="tenantNumber" value="${person.tenantNumber}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">通門コード</label>
                                <input type="text" class="form-control" name="tumonCode" value="${person.tumonCode}">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                    <button type="button" class="btn btn-primary" onclick="savePersonData(${personId})">
                        <i class="fas fa-save"></i> 保存
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    // Remove modal from DOM when hidden
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function savePersonData(personId) {
    const person = personalData.find(p => p.id === personId);
    if (!person) return;

    const form = document.getElementById('personEditForm');
    const formData = new FormData(form);

    // Update person data (simulated)
    person.managementNumber = formData.get('managementNumber');
    person.name = formData.get('name');
    person.katakana = formData.get('katakana');
    person.departmentCode = formData.get('departmentCode');
    person.kubunCode = formData.get('kubunCode');
    person.tenantNumber = formData.get('tenantNumber');
    person.tumonCode = formData.get('tumonCode');

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('personEditModal'));
    modal.hide();

    // Refresh table
    applyFiltersAndDisplay();
    showOperationStatus(`${person.name}のデータを保存しました`, 'success');
}

// Show history selection modal on right-click
function showHistorySelectionModal(person) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'historySelectionModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-history text-info"></i>
                        履歴表示設定 - ${person.name}
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
                    <button type="button" class="btn btn-primary" onclick="executeHistoryDisplay('${person.personalCode}', '${person.name}')">
                        <i class="fas fa-play"></i> 実行
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    // Remove modal from DOM when hidden
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function executeHistoryDisplay(personalCode, personName) {
    const periodOptions = [];
    const historyTypes = [];

    // Get selected periods
    if (document.getElementById('periodToday').checked) periodOptions.push('当日');
    if (document.getElementById('periodYesterday').checked) periodOptions.push('前日～');
    if (document.getElementById('periodWeek').checked) periodOptions.push('1週間前～');

    // Get selected history types
    if (document.getElementById('historyAll').checked) historyTypes.push('全て');
    if (document.getElementById('historyLightError').checked) historyTypes.push('軽エラー');
    if (document.getElementById('historyHeavyError').checked) historyTypes.push('重エラー');
    if (document.getElementById('historyRecovery').checked) historyTypes.push('重エラー復旧');

    if (periodOptions.length === 0 && historyTypes.length === 0) {
        alert('期間または履歴種類を選択してください');
        return;
    }

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('historySelectionModal'));
    modal.hide();

    // Show confirmation
    let message = `履歴画面に遷移します\n\n対象者: ${personName} (${personalCode})`;
    if (periodOptions.length > 0) {
        message += `\n期間: ${periodOptions.join(', ')}`;
    }
    if (historyTypes.length > 0) {
        message += `\n履歴種類: ${historyTypes.join(', ')}`;
    }

    alert(message);
}

// Direct functions for HTML attributes
function editPersonDirect(personId) {
    const person = personalData.find(p => p.id === personId);
    if (person) {
        console.log('Direct edit function called for:', person.name);
        alert(`編集画面に遷移します\n\n対象: ${person.name} (${person.personalCode})`);
    }
}

function showHistoryModalDirect(personId) {
    const person = personalData.find(p => p.id === personId);
    if (person) {
        console.log('Direct history modal function called for:', person.name);
        showHistorySelectionModal(person);
    }
}

// New direct functions for inline HTML events with enhanced event prevention
function editPersonDirectly(personId) {
    // Clear any text selection
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }

    const person = personalData.find(p => p.id === personId);
    if (person) {
        console.log('✅ ダブルクリック成功！編集画面に遷移:', person.name);
        alert(`✅ ダブルクリック成功！\n編集画面に遷移します\n\n対象: ${person.name} (${person.personalCode})`);
    }
    return false;
}

function showHistoryModalDirectly(personId) {
    // Clear any text selection and prevent default browser menu
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }

    const person = personalData.find(p => p.id === personId);
    if (person) {
        console.log('✅ 右クリック成功！履歴モーダル表示:', person.name);
        showHistorySelectionModal(person);
    }
    return false;
}

// 新しいシンプルなイベントハンドラー
function handleRowDoubleClick(personId, event) {
    console.log('🔥 handleRowDoubleClick called for person ID:', personId);

    // 完全にデフォルト動作を防ぐ
    if (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }

    // テキスト選択を強制クリア
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
    if (document.selection) {
        document.selection.empty();
    }

    const person = personalData.find(p => p.id === personId);
    if (person) {
        console.log('✅ ダブルクリック成功！編集画面に遷移:', person.name);
        alert(`✅ ダブルクリック成功！\n編集画面に遷移します\n\n対象: ${person.name} (${person.personalCode})`);
    }

    return false;
}

function handleRowRightClick(personId, event) {
    console.log('🔥 handleRowRightClick called for person ID:', personId);

    // 完全にデフォルト動作を防ぐ
    if (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }

    // テキスト選択を強制クリア
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }

    const person = personalData.find(p => p.id === personId);
    if (person) {
        console.log('✅ 右クリック成功！履歴モーダル表示:', person.name);
        showHistorySelectionModal(person);
    }

    return false;
}

// 🎯 成功確認済み遅延処理関数をJavaScriptファイルに追加
let personClickTimer = null;
let personClickCount = 0;
let lastClickedPersonId = null;

function handlePersonRowClick(personId, personName, element, event) {
    console.log(`🖱️ handlePersonRowClick実行: ${personName}`);
    console.log(`🖱️ 現在のクリック数: ${personClickCount}`);
    console.log(`🖱️ 前回クリック対象: ${lastClickedPersonId}`);

    // 同じ行の連続クリックかチェック
    if (lastClickedPersonId !== personId) {
        console.log(`🔄 クリック対象変更: ${lastClickedPersonId} → ${personId}`);
        personClickCount = 0;
        lastClickedPersonId = personId;
    }

    personClickCount++;
    console.log(`📊 クリック数更新: ${personClickCount}`);

    if (personClickTimer) {
        console.log('⏱️ 既存タイマークリア');
        clearTimeout(personClickTimer);
    }

    console.log('⏱️ 300ms遅延タイマー開始');
    personClickTimer = setTimeout(() => {
        console.log(`⏰ タイマー実行: ${personClickCount}回クリック`);

        if (personClickCount === 1) {
            console.log(`🔥 ${personName} シングルクリック確定`);
            // シングルクリック時は何もしない
        } else if (personClickCount >= 2) {
            console.log(`🔥🔥 ${personName} ダブルクリック確定`);
            console.log(`🔥🔥 ${personName}の編集画面遷移処理開始`);
            alert(`🔥🔥 ${personName}の編集画面に遷移します`);
        }

        console.log('🔄 クリック状態リセット');
        personClickCount = 0;
        lastClickedPersonId = null;
    }, 300);
}

// 🚨 実用解決策: 超遅ダブルクリック関数
function handleSuperSlowDoubleClick(element, personId, personName) {
    console.log(`🐌 超遅処理開始: ${personName}`);

    const currentCount = parseInt(element.dataset.clickCount || 0);
    const newCount = currentCount + 1;
    element.dataset.clickCount = newCount;

    console.log(`🐌 ${personName} クリック回数: ${newCount}`);

    // 2秒以内の2回目のクリックでダブルクリック判定
    setTimeout(() => {
        const finalCount = parseInt(element.dataset.clickCount || 0);
        console.log(`🐌 ${personName} 最終判定: ${finalCount}回`);

        if (finalCount >= 2) {
            console.log(`🐌🐌 ${personName} 超遅ダブルクリック成功！`);
            alert(`🐌🐌 ${personName}の編集画面に遷移します（超遅ダブルクリック）`);
        } else {
            console.log(`🐌 ${personName} シングルクリック`);
        }

        // カウンターリセット
        element.dataset.clickCount = 0;
    }, 2000);
}

// 🎯 statusMonitorと同じ関数名・構造で実装
function showPersonEditModal(personId, personName) {
    console.log(`🔥🔥 showPersonEditModal実行: ${personName}`);
    alert(`🔥🔥 ${personName}の編集画面に遷移します（statusMonitor完全模倣）`);
}

function showPersonHistoryModal(personId, personName) {
    console.log(`🔥 showPersonHistoryModal実行: ${personName}`);

    // statusMonitorと同じ構造でモーダル作成
    const existingPopup = document.getElementById('personHistoryModal');
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement('div');
    popup.id = 'personHistoryModal';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #17a2b8;
        border-radius: 8px;
        padding: 20px;
        z-index: 9999;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        min-width: 350px;
    `;

    popup.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h5 style="margin: 0; color: #17a2b8;">履歴選択</h5>
            <p style="margin: 5px 0 0 0; color: #666;">対象: ${personName}</p>
        </div>
        <div style="border: 2px solid #17a2b8; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
            <h6 style="margin: 0 0 10px 0; color: #17a2b8;">期間</h6>
            <div style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; cursor: pointer; padding: 5px;">
                    <input type="checkbox" name="personHistoryPeriod" value="today" style="margin-right: 12px;"> 当日
                </label>
            </div>
            <div style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; cursor: pointer; padding: 5px;">
                    <input type="checkbox" name="personHistoryPeriod" value="yesterday" style="margin-right: 12px;"> 前日～
                </label>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: flex; align-items: center; cursor: pointer; padding: 5px;">
                    <input type="checkbox" name="personHistoryPeriod" value="week" style="margin-right: 12px;"> 1週間前～
                </label>
            </div>
            
            <h6 style="margin: 15px 0 10px 0; color: #17a2b8;">履歴種類</h6>
            <div style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; cursor: pointer; padding: 5px;">
                    <input type="checkbox" name="personHistoryType" value="all" style="margin-right: 12px;"> 全て
                </label>
            </div>
            <div style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; cursor: pointer; padding: 5px;">
                    <input type="checkbox" name="personHistoryType" value="minor_error" style="margin-right: 12px;"> 軽エラー
                </label>
            </div>
            <div style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; cursor: pointer; padding: 5px;">
                    <input type="checkbox" name="personHistoryType" value="major_error" style="margin-right: 12px;"> 重エラー
                </label>
            </div>
            <div style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; cursor: pointer; padding: 5px;">
                    <input type="checkbox" name="personHistoryType" value="error_recovery" style="margin-right: 12px;"> 重エラー復旧
                </label>
            </div>
        </div>
        <div style="text-align: center; display: flex; gap: 10px; justify-content: center;">
            <button onclick="executePersonHistorySearch('${personId}', '${personName}')" 
                    style="padding: 10px 20px; border: none; border-radius: 4px; background: #17a2b8; color: white; cursor: pointer;">
                実行
            </button>
            <button onclick="closePersonHistoryModal()" 
                    style="padding: 10px 20px; border: 1px solid #ccc; border-radius: 4px; background: #f8f9fa; cursor: pointer;">
                キャンセル
            </button>
        </div>
    `;

    const overlay = document.createElement('div');
    overlay.id = 'personHistoryOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9998;
    `;
    overlay.onclick = () => closePersonHistoryModal();

    document.body.appendChild(overlay);
    document.body.appendChild(popup);
}

function closePersonHistoryModal() {
    const popup = document.getElementById('personHistoryModal');
    const overlay = document.getElementById('personHistoryOverlay');
    if (popup) popup.remove();
    if (overlay) overlay.remove();
}

function executePersonHistorySearch(personId, personName) {
    const selectedPeriod = document.querySelector('input[name="personHistoryPeriod"]:checked');
    const selectedType = document.querySelector('input[name="personHistoryType"]:checked');

    if (!selectedPeriod || !selectedType) {
        alert('期間と履歴種類を選択してください。');
        return;
    }

    const periodNames = { 'today': '当日', 'yesterday': '前日～', 'week': '1週間前～' };
    const typeNames = { 'all': '全て', 'minor_error': '軽エラー', 'major_error': '重エラー', 'error_recovery': '重エラー復旧' };

    const periodName = periodNames[selectedPeriod.value];
    const typeName = typeNames[selectedType.value];

    console.log(`履歴検索実行: ${personName} - 期間: ${periodName}, 種類: ${typeName}`);
    alert(`${personName}の履歴検索を実行します\n期間: ${periodName}\n種類: ${typeName}`);
    closePersonHistoryModal();
}

// 🎯 実データ行用の安定したクリック処理
function handleDataRowClick(element, personId, personName) {
    console.log(`🎯 ${personName} 実データ行クリック検出`);

    const currentTime = Date.now();
    const lastClickTime = parseInt(element.dataset.lastClickTime || 0);
    const timeDiff = currentTime - lastClickTime;

    console.log(`🎯 ${personName} クリック間隔: ${timeDiff}ms`);

    // 2秒以内の連続クリックでダブルクリック判定
    if (timeDiff < 2000 && timeDiff > 50) { // 50ms～2000ms
        console.log(`🎯🎯 ${personName} ダブルクリック成功！`);
        alert(`🎯🎯 ${personName}の編集画面に遷移します`);
        element.dataset.lastClickTime = 0; // リセット
    } else {
        console.log(`🎯 ${personName} シングルクリック（次のクリック待機中）`);
        element.dataset.lastClickTime = currentTime;

        // 3秒後にリセット
        setTimeout(() => {
            element.dataset.lastClickTime = 0;
            console.log(`🎯 ${personName} クリック待機タイムアウト`);
        }, 3000);
    }
}

// 🚫 右クリック代替機能：Ctrl+クリック
document.addEventListener('click', function (event) {
    if (event.ctrlKey || event.metaKey) { // Ctrl+クリック または Cmd+クリック
        const row = event.target.closest('tr.personal-row');
        if (row) {
            event.preventDefault();
            const personId = row.dataset.personId;
            const personName = row.dataset.personName;
            console.log(`🚫 ${personName} Ctrl+クリック検出（右クリック代替）`);
            alert(`🚫 ${personName}の履歴選択表示（Ctrl+クリック）`);
        }
    }
});

// 🚫 長押し検出で右クリック代替
let longPressTimer = null;
let isLongPress = false;

document.addEventListener('mousedown', function (event) {
    const row = event.target.closest('tr.personal-row');
    if (row) {
        isLongPress = false;
        longPressTimer = setTimeout(() => {
            isLongPress = true;
            const personName = row.dataset.personName;
            console.log(`🚫 ${personName} 長押し検出（右クリック代替）`);
            alert(`🚫 ${personName}の履歴選択表示（長押し）`);
        }, 1000); // 1秒長押し
    }
});

document.addEventListener('mouseup', function (event) {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
    }
});

document.addEventListener('mouseleave', function (event) {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
    }
});