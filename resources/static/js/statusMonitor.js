/**
 * システムステータス監視 JavaScript
 * ゲート機器の稼働状況をリアルタイム監視
 */
class StatusMonitor {
    constructor() {
        this.gates = [];
        this.gateGroups = []; // ゲートグループ
        this.currentLayout = 32; // デフォルト表示数
        this.statusTypes = ['normal', 'warning', 'error', 'offline'];
        this.refreshInterval = 5000; // 5秒間隔
        this.legendVisible = true;
        this.currentGateId = null;
        this.selectedGateGroup = null; // 選択されたゲートグループ
        this.sidebarCollapsed = false;
        this.statusFilters = ['normal', 'warning', 'error', 'offline']; // フィルター設定
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateGateData();
        this.generateGateGroups();
        this.renderGateButtons();
        this.renderGates();
        this.startAutoRefresh();
        this.handleResize();
    }

    setupEventListeners() {
        // レイアウト切替ボタン
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const layout = parseInt(e.target.dataset.layout);
                this.switchLayout(layout);
            });
        });


        // ウィンドウリサイズ対応
        window.addEventListener('resize', () => {
            this.handleResize();
        });


        // サイドバートグルボタン
        document.getElementById('sidebarToggle')?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // ステータスフィルターチェックボックス（遅延実行で確実にDOM要素を取得）
        setTimeout(() => {
            document.querySelectorAll('.status-filter-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    console.log('Filter changed:', checkbox.value, checkbox.checked);
                    this.updateStatusFilters();
                });
            });
            console.log('Status filter checkboxes initialized:', document.querySelectorAll('.status-filter-checkbox').length);
        }, 100);
    }

    generateGateData() {
        // 1000ゲートのデータを生成
        for (let i = 1; i <= 1000; i++) {
            const gateNumber = i.toString().padStart(4, '0');
            const gateName = this.getGateName(i);
            const status = this.getRandomStatus();
            
            this.gates.push({
                id: i,
                number: gateNumber,
                name: gateName,
                status: status,
                lastUpdated: new Date(),
                online: Math.random() > 0.1, // 90%の確率でオンライン
                location: this.getLocationName(i),
                icons: this.generateIconStatuses()
            });
        }
    }

    generateIconStatuses() {
        // 4つのアイコンの状態をランダム生成（sensorの代わりにsecurityを使用）
        const iconTypes = ['door', 'card', 'comm', 'security'];
        return iconTypes.map(type => {
            const rand = Math.random();
            let status = 'normal';
            
            if (rand < 0.05) status = 'error';
            else if (rand < 0.15) status = 'warning';
            else if (rand < 0.20) status = 'offline';
            
            return {
                type: type,
                status: status,
                label: this.getIconLabel(type)
            };
        });
    }

    getIconLabel(type) {
        // アルファベットラベルは使用しない
        return '';
    }

    getRandomStatus() {
        const weights = [0.7, 0.15, 0.1, 0.05]; // normal, warning, error, offline
        const rand = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < weights.length; i++) {
            cumulative += weights[i];
            if (rand <= cumulative) {
                return this.statusTypes[i];
            }
        }
        return 'normal';
    }

    getGateName(id) {
        const gateNames = [
            '正面玄関', '裏口', '東口', '西口', '北口',
            '南口', 'サーバー室', '会議室入口', '役員室', 'オフィス東',
            'オフィス西', '資料室', '倉庫', '駐車場', '屋上',
            '地下', '休憩室', '応接室', 'ラボ入口', '工場入口'
        ];
        return gateNames[id % gateNames.length] || `ゲート${id}`;
    }

    getLocationName(id) {
        const locations = [
            'エントランス', 'サーバールーム', '会議室A', '会議室B', '役員室',
            'オフィス1F', 'オフィス2F', 'オフィス3F', '資料室', '倉庫',
            '駐車場', '屋上', '地下室', '休憩室', '応接室'
        ];
        return locations[id % locations.length] || `エリア${id}`;
    }

    generateGateGroups() {
        // 100件のゲートグループを動的に生成
        this.gateGroups = [];
        
        for (let i = 0; i < 100; i++) {
            const startGate = i * 10 + 1;
            const endGate = (i + 1) * 10;
            const groupNumber = (i + 1).toString().padStart(4, '0');
            
            this.gateGroups.push({
                id: `gate-${groupNumber}`,
                name: `ゲート-${groupNumber}～`,
                range: [startGate, endGate],
                status: this.getGroupStatus([startGate, endGate])
            });
        }
    }

    getGroupStatus(range) {
        const gatesInRange = this.gates.filter(gate => 
            gate.id >= range[0] && gate.id <= range[1]
        );
        
        if (gatesInRange.some(gate => gate.status === 'error')) return 'error';
        if (gatesInRange.some(gate => gate.status === 'warning')) return 'warning';
        if (gatesInRange.some(gate => !gate.online)) return 'offline';
        return 'normal';
    }

    switchLayout(layout) {
        this.currentLayout = layout;
        
        // ボタンのアクティブ状態更新
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.layout) === layout);
        });

        this.updateGridLayout();
        this.renderGates();
    }

    updateGridLayout() {
        const grid = document.getElementById('gateGrid');
        const container = document.querySelector('.gate-grid-container');
        if (!grid || !container) return;

        // コンテナの実際の幅を取得（完全に安全な計算）
        const containerWidth = container.clientWidth;
        const gapSize = 6;
        const cardPadding = 16; // カード内のpadding
        const minCardContentWidth = 140; // カード内容の最小幅
        const minCardWidth = minCardContentWidth + cardPadding;
        
        // 完全に安全な列数計算（レイアウトに応じて調整）
        let maxCols = this.currentLayout === 64 ? 8 : 5;
        const totalGapWidth = gapSize * (maxCols - 1);
        const safetyMargin = this.currentLayout === 64 ? 10 : 20; // 64件時は余裕を少なく、全体的に余裕を減らす
        const availableWidthForCards = containerWidth - totalGapWidth - safetyMargin;
        let cols = Math.floor(availableWidthForCards / minCardWidth);
        
        // レイアウトに応じた制限
        if (this.currentLayout === 16) {
            cols = Math.min(cols, 4);
            cols = Math.max(cols, 2);
        } else if (this.currentLayout === 32) {
            cols = Math.min(cols, 5); // 確実に表示するため5列制限
            cols = Math.max(cols, 3);
        } else { // 64件
            cols = Math.min(cols, 8); // 64件は8列まで許可
            cols = Math.max(cols, 6);
        }
        
        const rows = Math.ceil(this.currentLayout / cols);
        const actualCardWidth = Math.floor((containerWidth - (cols-1) * gapSize) / cols);

        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        
        // 64件表示用のCSSクラスを適用
        if (this.currentLayout === 64) {
            grid.classList.add('layout-64');
        } else {
            grid.classList.remove('layout-64');
        }
        
        console.log(`Container: ${containerWidth}px, Cols: ${cols}, Layout: ${this.currentLayout}, Card: ${actualCardWidth}px`);
    }

    updateStatusFilters() {
        console.log('updateStatusFilters called');
        
        this.statusFilters = [];
        const checkboxes = document.querySelectorAll('.status-filter-checkbox:checked');
        console.log('Found checkboxes:', checkboxes.length);
        
        checkboxes.forEach(checkbox => {
            console.log('Checkbox value:', checkbox.value, 'checked:', checkbox.checked);
            this.statusFilters.push(checkbox.value);
        });
        
        console.log('Current status filters:', this.statusFilters);
        console.log('Total gates before filter:', this.gates.length);
        
        // ゲートのステータス分布を確認
        const statusCounts = {};
        this.gates.slice(0, this.currentLayout).forEach(gate => {
            const status = gate.online ? gate.status : 'offline';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        console.log('Gate status distribution:', statusCounts);
        
        this.renderGates();
        this.renderGateButtons(); // ボタン一覧も更新
    }

    renderGates() {
        const grid = document.getElementById('gateGrid');
        if (!grid) return;

        grid.innerHTML = '';

        let displayGates;
        if (this.selectedGateGroup) {
            // 選択されたグループのゲートのみ表示
            const group = this.gateGroups.find(g => g.id === this.selectedGateGroup);
            if (group) {
                displayGates = this.gates.filter(gate => 
                    gate.id >= group.range[0] && gate.id <= group.range[1]
                );
            } else {
                displayGates = this.gates.slice(0, this.currentLayout);
            }
        } else {
            // 全ゲート表示
            displayGates = this.gates.slice(0, this.currentLayout);
        }

        // ステータスフィルターを適用
        const beforeFilterCount = displayGates.length;
        console.log('Before filter - gates to check:', displayGates.length);
        console.log('Active status filters:', this.statusFilters);
        
        const filteredGates = [];
        displayGates.forEach((gate, index) => {
            const gateStatus = gate.online ? gate.status : 'offline';
            const shouldInclude = this.statusFilters.includes(gateStatus);
            
            console.log(`Gate ${gate.number}: status=${gateStatus}, online=${gate.online}, shouldInclude=${shouldInclude}`);
            
            if (shouldInclude) {
                filteredGates.push(gate);
            }
        });
        
        displayGates = filteredGates;
        console.log(`Gates after filter: ${displayGates.length} (was ${beforeFilterCount})`);

        displayGates.forEach(gate => {
            const gateCard = this.createGateCard(gate);
            grid.appendChild(gateCard);
        });
    }

    renderGateButtons() {
        const buttonList = document.getElementById('gateButtonList');
        if (!buttonList) return;

        buttonList.innerHTML = '';

        this.gateGroups.forEach(group => {
            // グループが現在のフィルターに該当するかチェック
            const shouldShow = this.statusFilters.includes(group.status);
            if (!shouldShow) return;

            const button = document.createElement('button');
            button.className = 'gate-button';
            button.setAttribute('data-group-id', group.id);
            
            const statusClass = `status-${group.status}`;
            button.innerHTML = `
                <span class="gate-button-text">${group.name}</span>
                <span class="gate-button-short">${group.name.substring(0, 3)}</span>
                <div class="gate-button-status ${statusClass}"></div>
                <div class="collapsed-gate-icon ${statusClass}"></div>
            `;
            
            button.addEventListener('click', () => {
                this.selectGateGroup(group.id);
            });
            
            buttonList.appendChild(button);
        });
    }

    selectGateGroup(groupId) {
        // 以前のアクティブボタンを解除
        document.querySelectorAll('.gate-button.active').forEach(btn => {
            btn.classList.remove('active');
        });

        // 新しいボタンをアクティブに
        const button = document.querySelector(`[data-group-id="${groupId}"]`);
        if (button) {
            button.classList.add('active');
        }

        this.selectedGateGroup = groupId;
        this.renderGates();
    }

    toggleSidebar() {
        const sidebar = document.getElementById('leftSidebar');
        const container = document.querySelector('.status-monitor-container');
        const toggleIcon = document.getElementById('toggleIcon');
        
        this.sidebarCollapsed = !this.sidebarCollapsed;
        
        if (this.sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            container.classList.add('sidebar-collapsed');
            toggleIcon.textContent = '›';
        } else {
            sidebar.classList.remove('collapsed');
            container.classList.remove('sidebar-collapsed');
            toggleIcon.textContent = '‹';
        }
        
        // グリッドレイアウトを再計算
        setTimeout(() => {
            this.handleResize();
        }, 300); // CSS transitionの完了を待つ
    }

    createGateCard(gate) {
        const card = document.createElement('div');
        card.className = 'gate-card';
        card.setAttribute('data-gate-id', gate.id);

        // 状態に応じたボーダーカラー
        const statusClass = gate.online ? gate.status : 'offline';
        card.style.borderColor = this.getStatusColor(statusClass);

        // アイコングリッドを生成
        const iconGridHtml = this.createIconGrid(gate.icons);

        card.innerHTML = `
            <div class="gate-info">
                <div class="gate-number">${gate.number}/${gate.name}</div>
                <div class="gate-status-indicator status-${statusClass}"></div>
            </div>
            ${iconGridHtml}
        `;

        // ダブルクリックで直接遠隔操作画面を表示
        card.addEventListener('dblclick', () => {
            this.showRemoteControl(gate.number);
        });
        
        // 右クリックでコンテキストメニュー表示
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, gate.number);
        });

        return card;
    }

    createIconGrid(icons) {
        let iconHtml = '<div class="icon-grid">';
        
        icons.forEach(icon => {
            const iconClass = this.getIconClass(icon.status, icon.type);
            iconHtml += `<div class="status-icon ${iconClass}" data-type="${icon.type}"></div>`;
        });
        
        iconHtml += '</div>';
        return iconHtml;
    }

    getIconClass(status, type) {
        if (status === 'error') return 'icon-error';
        if (status === 'warning') return 'icon-security';
        if (status === 'offline') return 'icon-offline';
        
        // 正常時は各アイコンタイプに応じた色
        return `icon-${type}`;
    }

    getStatusColor(status) {
        const colors = {
            'normal': '#28a745',
            'warning': '#ffc107', 
            'error': '#dc3545',
            'offline': '#6c757d'
        };
        return colors[status] || '#dee2e6';
    }





    toggleLegend() {
        const legendPanel = document.getElementById('legendPanel');
        const toggleBtn = document.getElementById('toggleLegend');
        
        if (legendPanel && toggleBtn) {
            this.legendVisible = !this.legendVisible;
            legendPanel.style.display = this.legendVisible ? 'block' : 'none';
            toggleBtn.textContent = this.legendVisible ? '凡例非表示' : '凡例表示';
        }
    }

    startAutoRefresh() {
        setInterval(() => {
            this.updateGateStatuses();
        }, this.refreshInterval);
    }

    updateGateStatuses() {
        // ランダムに数個のゲートの状態を更新
        const updateCount = Math.floor(Math.random() * 3) + 1; // 1-3個更新
        
        for (let i = 0; i < updateCount; i++) {
            const randomIndex = Math.floor(Math.random() * this.gates.length);
            const gate = this.gates[randomIndex];
            
            // 10%の確率で状態変更
            if (Math.random() < 0.1) {
                gate.status = this.getRandomStatus();
                gate.lastUpdated = new Date();
                gate.online = Math.random() > 0.05; // 95%の確率でオンライン
                gate.icons = this.generateIconStatuses(); // アイコン状態も更新
            }
        }

        // グループステータスも更新
        this.gateGroups.forEach(group => {
            group.status = this.getGroupStatus(group.range);
        });

        this.renderGateButtons();
        this.renderGates();
    }

    handleResize() {
        // レスポンシブ対応: 画面サイズに応じて自動調整
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // 画面サイズに応じた推奨表示数を計算
        let recommendedLayout = 32;
        
        if (screenWidth >= 1920 && screenHeight >= 1080) {
            recommendedLayout = 64;
        } else if (screenWidth >= 1400) {
            recommendedLayout = 32;
        } else if (screenWidth < 992) {
            recommendedLayout = 16;
        }

        // 現在のレイアウトが画面サイズに適さない場合は自動調整
        if (this.currentLayout > recommendedLayout) {
            this.switchLayout(recommendedLayout);
        }

        this.updateGridLayout();
    }

    // 外部からアクセス可能なメソッド
    refreshData() {
        this.generateGateData();
        this.renderGates();
    }

    setRefreshInterval(interval) {
        this.refreshInterval = interval;
    }

    showGateOperations(gateNumber) {
        // ゲートカード全体をクリックした時に履歴/遠隔操作選択ポップアップを表示
        this.showGateSelectionModal(gateNumber);
    }

    showGateSelectionModal(gateNumber) {
        // 既存のポップアップがあれば削除
        const existingPopup = document.getElementById('gateSelectionPopup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // ポップアップを作成
        const popup = document.createElement('div');
        popup.id = 'gateSelectionPopup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #007bff;
            border-radius: 8px;
            padding: 20px;
            z-index: 9999;
            box-shadow: 0 4px 16px rgba(0,0,0,0.3);
            min-width: 300px;
        `;

        popup.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h5 style="margin: 0; color: #007bff;">${gateNumber}</h5>
                <p style="margin: 5px 0 0 0; color: #666;">※枠内クリック<br>※複数選択不可</p>
            </div>
            <div style="display: flex; gap: 20px; justify-content: center;">
                <div style="text-align: center;">
                    <div style="border: 2px solid #17a2b8; border-radius: 8px; padding: 15px; cursor: pointer; background: #f8f9fa;" 
                         onclick="statusMonitor.showHistoryOptions('${gateNumber}')">
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <span style="color: #17a2b8; font-size: 1.5em; margin-right: 8px;">✓</span>
                            <span style="color: #17a2b8; font-size: 1.5em;">✗</span>
                        </div>
                        <strong>履歴操作</strong>
                    </div>
                </div>
                <div style="text-align: center;">
                    <div style="border: 2px solid #6f42c1; border-radius: 8px; padding: 15px; cursor: pointer; background: #f8f9fa;" 
                         onclick="statusMonitor.showRemoteOptions('${gateNumber}')">
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <span style="color: #6f42c1; font-size: 1.5em; margin-right: 8px;">✓</span>
                            <span style="color: #6f42c1; font-size: 1.5em;">✗</span>
                        </div>
                        <strong>遠隔操作</strong>
                    </div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 15px;">
                <button onclick="statusMonitor.closeGateSelectionModal()" 
                        style="padding: 5px 15px; border: 1px solid #ccc; border-radius: 4px; background: #f8f9fa; cursor: pointer;">
                    閉じる
                </button>
            </div>
        `;

        // オーバーレイを作成
        const overlay = document.createElement('div');
        overlay.id = 'gateSelectionOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9998;
        `;
        overlay.onclick = () => this.closeGateSelectionModal();

        document.body.appendChild(overlay);
        document.body.appendChild(popup);
    }

    showHistoryOptions(gateNumber) {
        this.closeGateSelectionModal();
        alert(`${gateNumber}の履歴表示機能（未実装）`);
    }

    showRemoteOptions(gateNumber) {
        this.closeGateSelectionModal();
        this.showRemoteControl(gateNumber);
    }

    showRemoteControl(gateNumber) {
        this.currentGateId = gateNumber;
        this.showRemoteControlModal(gateNumber);
    }

    showRemoteControlModal(gateNumber) {
        // 既存のポップアップがあれば削除
        const existingPopup = document.getElementById('remoteModal');
        if (existingPopup) {
            existingPopup.remove();
        }

        // 遠隔操作ポップアップを作成
        const popup = document.createElement('div');
        popup.id = 'remoteModal';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #6f42c1;
            border-radius: 8px;
            padding: 20px;
            z-index: 9999;
            box-shadow: 0 4px 16px rgba(0,0,0,0.3);
            min-width: 300px;
        `;

        popup.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h5 style="margin: 0; color: #6f42c1;">遠隔操作</h5>
                <p style="margin: 5px 0 0 0; color: #666;">ゲート: ${gateNumber}</p>
            </div>
            <div style="border: 2px solid #6f42c1; border-radius: 8px; padding: 15px; margin-bottom: 15px;" id="remoteControlForm">
                <div style="margin-bottom: 12px;">
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 8px;">
                        <input type="checkbox" name="remoteOperation" value="continuous_unlock" style="margin-right: 12px;" onchange="statusMonitor.handleRemoteCheckbox(this)"> 連続解錠
                    </label>
                </div>
                <div style="margin-bottom: 12px;">
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 8px;">
                        <input type="checkbox" name="remoteOperation" value="unlock" style="margin-right: 12px;" onchange="statusMonitor.handleRemoteCheckbox(this)"> 解錠
                    </label>
                </div>
                <div style="margin-bottom: 12px;">
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 8px;">
                        <input type="checkbox" name="remoteOperation" value="lock" style="margin-right: 12px;" onchange="statusMonitor.handleRemoteCheckbox(this)"> 施錠
                    </label>
                </div>
                <div style="margin-bottom: 12px;">
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 8px;">
                        <input type="checkbox" name="remoteOperation" value="security_set" style="margin-right: 12px;" onchange="statusMonitor.handleRemoteCheckbox(this)"> 警備セット
                    </label>
                </div>
                <div style="margin-bottom: 12px;">
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 8px;">
                        <input type="checkbox" name="remoteOperation" value="security_unset" style="margin-right: 12px;" onchange="statusMonitor.handleRemoteCheckbox(this)"> 警備セット解除
                    </label>
                </div>
            </div>
            <div style="text-align: center; display: flex; gap: 10px; justify-content: center;">
                <button onclick="statusMonitor.executeRemoteOperation('${gateNumber}')" 
                        style="padding: 10px 20px; border: none; border-radius: 4px; background: #6f42c1; color: white; cursor: pointer; font-size: 14px;">
                    決定
                </button>
                <button onclick="statusMonitor.closeRemoteModal()" 
                        style="padding: 10px 20px; border: 1px solid #ccc; border-radius: 4px; background: #f8f9fa; cursor: pointer; font-size: 14px;">
                    キャンセル
                </button>
            </div>
        `;

        // オーバーレイを作成
        const overlay = document.createElement('div');
        overlay.id = 'remoteOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9998;
        `;
        overlay.onclick = () => this.closeRemoteModal();

        document.body.appendChild(overlay);
        document.body.appendChild(popup);
    }

    executeRemoteOperation(gateNumber) {
        // 選択された遠隔操作を取得
        const selectedCheckbox = document.querySelector('input[name="remoteOperation"]:checked');
        
        if (!selectedCheckbox) {
            alert('操作を選択してください。');
            return;
        }
        
        const selectedOperation = selectedCheckbox.value;
        const operationNames = {
            'continuous_unlock': '連続解錠',
            'unlock': '解錠',
            'lock': '施錠',
            'security_set': '警備セット',
            'security_unset': '警備セット解除'
        };
        
        const operationName = operationNames[selectedOperation] || selectedOperation;
        console.log(`遠隔操作実行: ${gateNumber} - ${operationName}`);
        alert(`${gateNumber}に${operationName}を実行します`);
        this.closeRemoteModal();
    }

    closeRemoteModal() {
        const popup = document.getElementById('remoteModal');
        const overlay = document.getElementById('remoteOverlay');
        if (popup) popup.remove();
        if (overlay) overlay.remove();
    }

    handleRemoteCheckbox(checkbox) {
        // 複数選択不可：他のチェックボックスをクリア
        if (checkbox.checked) {
            const otherCheckboxes = document.querySelectorAll('input[name="remoteOperation"]');
            otherCheckboxes.forEach(cb => {
                if (cb !== checkbox) {
                    cb.checked = false;
                }
            });
        }
    }

    closeGateSelectionModal() {
        const popup = document.getElementById('gateSelectionPopup');
        const overlay = document.getElementById('gateSelectionOverlay');
        if (popup) popup.remove();
        if (overlay) overlay.remove();
    }
    
    // 右クリックで履歴検索モーダル表示
    showContextMenu(event, gateNumber) {
        event.preventDefault();
        this.showHistoryModal(gateNumber);
    }

    showHistoryModal(gateNumber) {
        // 既存のポップアップがあれば削除
        const existingPopup = document.getElementById('historyModal');
        if (existingPopup) {
            existingPopup.remove();
        }

        // 履歴ポップアップを作成
        const popup = document.createElement('div');
        popup.id = 'historyModal';
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
                <h5 style="margin: 0; color: #17a2b8;">報告書作成</h5>
                <p style="margin: 5px 0 0 0; color: #666;">ゲート: ${gateNumber}</p>
            </div>
            <div style="border: 2px solid #17a2b8; border-radius: 8px; padding: 15px; margin-bottom: 15px;" id="historyForm">
                <h6 style="margin: 0 0 10px 0; color: #17a2b8;">期間</h6>
                <div style="margin-bottom: 8px;">
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 5px;">
                        <input type="checkbox" name="historyPeriod" value="today" style="margin-right: 12px;" onchange="statusMonitor.handleHistoryPeriodCheckbox(this)"> 当日
                    </label>
                </div>
                <div style="margin-bottom: 8px;">
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 5px;">
                        <input type="checkbox" name="historyPeriod" value="yesterday" style="margin-right: 12px;" onchange="statusMonitor.handleHistoryPeriodCheckbox(this)"> 前日～
                    </label>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 5px;">
                        <input type="checkbox" name="historyPeriod" value="week" style="margin-right: 12px;" onchange="statusMonitor.handleHistoryPeriodCheckbox(this)"> 1週間前～
                    </label>
                </div>
                
                <h6 style="margin: 15px 0 10px 0; color: #17a2b8;">履歴種類</h6>
                <div style="margin-bottom: 8px;">
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 5px;">
                        <input type="checkbox" name="historyType" value="all" style="margin-right: 12px;" onchange="statusMonitor.handleHistoryTypeCheckbox(this)"> 全て
                    </label>
                </div>
                <div style="margin-bottom: 8px;">
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 5px;">
                        <input type="checkbox" name="historyType" value="minor_error" style="margin-right: 12px;" onchange="statusMonitor.handleHistoryTypeCheckbox(this)"> 軽エラー
                    </label>
                </div>
                <div style="margin-bottom: 8px;">
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 5px;">
                        <input type="checkbox" name="historyType" value="major_error" style="margin-right: 12px;" onchange="statusMonitor.handleHistoryTypeCheckbox(this)"> 重エラー
                    </label>
                </div>
                <div style="margin-bottom: 8px;">
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 5px;">
                        <input type="checkbox" name="historyType" value="error_recovery" style="margin-right: 12px;" onchange="statusMonitor.handleHistoryTypeCheckbox(this)"> 重エラー復旧
                    </label>
                </div>
            </div>
            <div style="text-align: center; display: flex; gap: 10px; justify-content: center;">
                <button onclick="statusMonitor.executeReportCreation('${gateNumber}')" 
                        style="padding: 10px 20px; border: none; border-radius: 4px; background: #17a2b8; color: white; cursor: pointer; font-size: 14px;">
                    作成
                </button>
                <button onclick="statusMonitor.closeHistoryModal()" 
                        style="padding: 10px 20px; border: 1px solid #ccc; border-radius: 4px; background: #f8f9fa; cursor: pointer; font-size: 14px;">
                    キャンセル
                </button>
            </div>
        `;

        // オーバーレイを作成
        const overlay = document.createElement('div');
        overlay.id = 'historyOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9998;
        `;
        overlay.onclick = () => this.closeHistoryModal();

        document.body.appendChild(overlay);
        document.body.appendChild(popup);
    }

    executeReportCreation(gateNumber) {
        // 選択された期間と履歴種類を取得
        const selectedPeriod = document.querySelector('input[name="historyPeriod"]:checked');
        const selectedType = document.querySelector('input[name="historyType"]:checked');
        
        if (!selectedPeriod) {
            alert('期間を選択してください。');
            return;
        }
        
        if (!selectedType) {
            alert('履歴種類を選択してください。');
            return;
        }
        
        const periodNames = {
            'today': '当日',
            'yesterday': '前日～',
            'week': '1週間前～'
        };
        
        const typeNames = {
            'all': '全て',
            'minor_error': '軽エラー',
            'major_error': '重エラー',
            'error_recovery': '重エラー復旧'
        };
        
        const periodName = periodNames[selectedPeriod.value] || selectedPeriod.value;
        const typeName = typeNames[selectedType.value] || selectedType.value;
        
        console.log(`報告書作成: ${gateNumber} - 期間: ${periodName}, 種類: ${typeName}`);
        alert(`${gateNumber}の報告書を作成します\n期間: ${periodName}\n種類: ${typeName}`);
        this.closeHistoryModal();
    }

    closeHistoryModal() {
        const popup = document.getElementById('historyModal');
        const overlay = document.getElementById('historyOverlay');
        if (popup) popup.remove();
        if (overlay) overlay.remove();
    }

    handleHistoryPeriodCheckbox(checkbox) {
        // 複数選択不可：他の期間チェックボックスをクリア
        if (checkbox.checked) {
            const otherCheckboxes = document.querySelectorAll('input[name="historyPeriod"]');
            otherCheckboxes.forEach(cb => {
                if (cb !== checkbox) {
                    cb.checked = false;
                }
            });
        }
    }

    handleHistoryTypeCheckbox(checkbox) {
        // 複数選択不可：他の履歴種類チェックボックスをクリア
        if (checkbox.checked) {
            const otherCheckboxes = document.querySelectorAll('input[name="historyType"]');
            otherCheckboxes.forEach(cb => {
                if (cb !== checkbox) {
                    cb.checked = false;
                }
            });
        }
    }

    showGateDetails(gateNumber) {
        alert(`${gateNumber}の詳細情報を表示します`);
    }
}

// グローバルインスタンス
let statusMonitor;

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    statusMonitor = new StatusMonitor();
    window.statusMonitor = statusMonitor; // グローバルスコープに追加
});