import SwiftUI

@available(iOS 26.0, *)
struct SoundscapeDemoView: View {
    @State private var page: SoundscapePage = .bubbles
    @State private var captured = false
    @State private var playing = false
    @State private var recording = false
    @State private var prompt = 0

    var body: some View {
        ZStack {
            SoundscapeBackdrop()

            Group {
                switch page {
                case .bubbles:
                    BubbleHome(playing: $playing, onRoam: { page = .roam })
                case .roam:
                    RoamScreen(captured: $captured, playing: $playing)
                case .create:
                    CreateScreen(recording: $recording, prompt: $prompt)
                }
            }
            .padding(.horizontal, 24)
            .padding(.top, 12)
        }
        .safeAreaInset(edge: .bottom, spacing: 0) {
            SoundscapeTabBar(selection: $page)
                .padding(.horizontal, 30)
                .padding(.bottom, 8)
        }
        .preferredColorScheme(.light)
    }
}

private enum SoundscapePage: String, CaseIterable {
    case bubbles = "泡泡"
    case roam = "漫游"
    case create = "共创"

    var symbol: String {
        switch self {
        case .bubbles: "circle.grid.2x2"
        case .roam: "scope"
        case .create: "plus"
        }
    }
}

private struct SoundscapeBackdrop: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.96, green: 0.98, blue: 1.0), Color(red: 0.89, green: 0.93, blue: 0.98), Color(red: 0.95, green: 0.94, blue: 0.98)],
                startPoint: .top,
                endPoint: .bottom
            )
        }
        .ignoresSafeArea()
    }
}

private enum RecordingKind: String, CaseIterable, Identifiable {
    case all = "全部"
    case voice = "人声"
    case ambience = "环境声"
    case thought = "碎念"

    var id: String { rawValue }

    var tint: Color {
        switch self {
        case .all, .ambience: Color(red: 0.61, green: 0.77, blue: 0.9)
        case .voice: Color(red: 0.88, green: 0.65, blue: 0.75)
        case .thought: Color(red: 0.72, green: 0.68, blue: 0.84)
        }
    }

    var rim: [Color] {
        switch self {
        case .all, .ambience:
            [.white.opacity(0.95), Color(red: 0.53, green: 0.76, blue: 0.91).opacity(0.8), .white.opacity(0.32), Color(red: 0.78, green: 0.72, blue: 0.88).opacity(0.65), .white.opacity(0.92)]
        case .voice:
            [.white.opacity(0.95), Color(red: 0.9, green: 0.65, blue: 0.76).opacity(0.8), .white.opacity(0.34), Color(red: 0.94, green: 0.78, blue: 0.67).opacity(0.66), .white.opacity(0.92)]
        case .thought:
            [.white.opacity(0.95), Color(red: 0.73, green: 0.68, blue: 0.87).opacity(0.82), .white.opacity(0.32), Color(red: 0.68, green: 0.81, blue: 0.9).opacity(0.7), .white.opacity(0.92)]
        }
    }
}

private struct GalleryRecord: Identifiable {
    let id: String
    let index: String
    let title: String
    let kind: RecordingKind
    let duration: String
}

private let galleryRecords = [
    GalleryRecord(id: "wind", index: "01", title: "河面上的风", kind: .ambience, duration: "12 秒"),
    GalleryRecord(id: "bell", index: "02", title: "巷口的钟声", kind: .ambience, duration: "8 秒"),
    GalleryRecord(id: "steps", index: "03", title: "刚经过的人", kind: .voice, duration: "6 秒"),
    GalleryRecord(id: "osmanthus", index: "04", title: "桂花茶的下午", kind: .thought, duration: "10 秒"),
    GalleryRecord(id: "rain", index: "05", title: "雨停以后", kind: .thought, duration: "9 秒"),
]

private struct SoapBubble: View {
    var size: CGFloat
    var kind: RecordingKind = .ambience

    var body: some View {
        Circle()
            .fill(.ultraThinMaterial)
            .overlay {
                Circle().fill(RadialGradient(
                    colors: [.white.opacity(0.56), kind.tint.opacity(0.13), .clear],
                    center: .init(x: 0.28, y: 0.24),
                    startRadius: 1,
                    endRadius: size * 0.72
                ))
            }
            .overlay { Circle().stroke(AngularGradient(colors: kind.rim, center: .center), lineWidth: max(1, size * 0.014)) }
            .overlay(alignment: .topLeading) {
                Capsule()
                    .fill(.white.opacity(0.72))
                    .frame(width: size * 0.25, height: max(2, size * 0.035))
                    .blur(radius: 2)
                    .rotationEffect(.degrees(-34))
                    .offset(x: size * 0.2, y: size * 0.19)
            }
            .frame(width: size, height: size)
            .shadow(color: kind.tint.opacity(0.1), radius: size * 0.1, y: size * 0.05)
    }
}

private struct BubbleHome: View {
    @Binding var playing: Bool
    let onRoam: () -> Void
    @State private var filter: RecordingKind = .all
    @State private var activeRecordID = galleryRecords[0].id

    private var visibleRecords: [GalleryRecord] {
        filter == .all ? galleryRecords : galleryRecords.filter { $0.kind == filter }
    }

    private var activeRecord: GalleryRecord {
        galleryRecords.first(where: { $0.id == activeRecordID }) ?? galleryRecords[0]
    }

    var body: some View {
        VStack(spacing: 14) {
            HStack {
                Text("声音档案 · 个人收藏")
                    .font(.system(size: 11, weight: .regular))
                    .foregroundStyle(.secondary)
                Spacer()
                Label("装置已连接", systemImage: "dot.radiowaves.left.and.right")
                    .font(.system(size: 10, weight: .regular))
                    .foregroundStyle(.secondary)
            }

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 18) {
                    HStack(alignment: .bottom) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("我的回声")
                                .font(.system(size: 31, weight: .regular, design: .serif))
                                .foregroundStyle(Color(red: 0.2, green: 0.29, blue: 0.4))
                            Text("5 段声音 · 3 种内容")
                                .font(.system(size: 12, weight: .regular))
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text("01 — 05")
                            .font(.system(size: 10, weight: .regular, design: .monospaced))
                            .foregroundStyle(.secondary)
                            .padding(.bottom, 3)
                    }

                    HStack(spacing: 3) {
                        ForEach(RecordingKind.allCases) { kind in
                            Button {
                                withAnimation(.easeOut(duration: 0.2)) { filter = kind }
                            } label: {
                                Text(kind.rawValue)
                                    .font(.system(size: 11, weight: filter == kind ? .medium : .regular))
                                    .foregroundStyle(filter == kind ? Color.primary.opacity(0.78) : Color.secondary)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 9)
                                    .background {
                                        if filter == kind {
                                            Capsule().fill(.white.opacity(0.72))
                                        }
                                    }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(4)
                    .glassEffect(.regular, in: Capsule())

                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text("最近收录")
                                .font(.system(size: 13, weight: .medium))
                            Spacer()
                            Text("按声音类型整理")
                                .font(.system(size: 10, weight: .regular))
                                .foregroundStyle(.secondary)
                        }

                        if let featured = visibleRecords.first {
                            GalleryRecordTile(record: featured, featured: true, playing: playing && activeRecordID == featured.id) {
                                select(featured)
                            }
                        }

                        LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                            ForEach(Array(visibleRecords.dropFirst())) { record in
                                GalleryRecordTile(record: record, featured: false, playing: playing && activeRecordID == record.id) {
                                    select(record)
                                }
                            }
                        }
                    }

                    Button { playing.toggle() } label: {
                        HStack(spacing: 11) {
                            Image(systemName: playing ? "pause.fill" : "play.fill")
                                .font(.system(size: 12, weight: .semibold))
                                .frame(width: 34, height: 34)
                                .background(.white.opacity(0.62), in: Circle())
                            VStack(alignment: .leading, spacing: 3) {
                                Text(activeRecord.title).font(.system(size: 12, weight: .medium))
                                Text("\(activeRecord.kind.rawValue) · \(activeRecord.duration)")
                                    .font(.system(size: 10)).foregroundStyle(.secondary)
                            }
                            Spacer(minLength: 4)
                            WaveBars(active: playing)
                        }
                        .padding(.horizontal, 13)
                        .padding(.vertical, 9)
                        .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
                    }
                    .buttonStyle(.plain)

                    Button(action: onRoam) {
                        Label("继续漫游", systemImage: "scope")
                            .font(.system(size: 13, weight: .medium))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 13)
                            .glassEffect(.regular, in: Capsule())
                    }
                    .buttonStyle(.plain)
                }
                .padding(.top, 6)
                .padding(.bottom, 20)
            }
        }
    }

    private func select(_ record: GalleryRecord) {
        let wasActive = activeRecordID == record.id
        activeRecordID = record.id
        playing = wasActive ? !playing : true
    }
}

private struct GalleryRecordTile: View {
    let record: GalleryRecord
    let featured: Bool
    let playing: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            if featured {
                HStack(spacing: 16) {
                    bubble(size: 90)
                    VStack(alignment: .leading, spacing: 7) {
                        Text(record.kind.rawValue)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundStyle(record.kind.tint)
                        Text(record.title)
                            .font(.system(size: 17, weight: .regular, design: .serif))
                            .foregroundStyle(Color.primary.opacity(0.82))
                        Text("\(record.index)  ·  \(record.duration)")
                            .font(.system(size: 10, weight: .regular, design: .monospaced))
                            .foregroundStyle(.secondary)
                    }
                    Spacer(minLength: 0)
                    Image(systemName: playing ? "pause.fill" : "play.fill")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(Color.primary.opacity(0.6))
                }
                .padding(.horizontal, 15)
                .padding(.vertical, 13)
                .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            } else {
                VStack(spacing: 7) {
                    bubble(size: 66)
                    Text(record.title)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(Color.primary.opacity(0.78))
                        .lineLimit(1)
                    Text("\(record.kind.rawValue) · \(record.duration)")
                        .font(.system(size: 9, weight: .regular))
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
            }
        }
        .buttonStyle(.plain)
    }

    private func bubble(size: CGFloat) -> some View {
        ZStack(alignment: .bottomTrailing) {
            SoapBubble(size: size, kind: record.kind)
            if playing {
                Image(systemName: "waveform")
                    .font(.system(size: 9, weight: .medium))
                    .foregroundStyle(Color(red: 0.34, green: 0.5, blue: 0.67))
                    .padding(6)
                    .background(.regularMaterial, in: Circle())
                    .offset(x: 4, y: 3)
            }
        }
        .scaleEffect(playing ? 1.035 : 1)
        .animation(.easeOut(duration: 0.22), value: playing)
    }
}

private struct BubbleConstellation: View {
    var body: some View {
        ZStack {
            Circle().stroke(.white.opacity(0.33), lineWidth: 1).frame(width: 205, height: 205)
            Circle().stroke(.white.opacity(0.2), lineWidth: 1).frame(width: 240, height: 240)
            SoapBubble(size: 132).offset(x: 0, y: 0)
            SoapBubble(size: 62).offset(x: -84, y: 19)
            SoapBubble(size: 44).offset(x: 84, y: -18)
            SoapBubble(size: 28).offset(x: -36, y: 105)
            SoapBubble(size: 20).offset(x: 71, y: 95)
        }
        .frame(height: 252)
    }
}

private struct RoamScreen: View {
    @Binding var captured: Bool
    @Binding var playing: Bool

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Label("江湾 · 漫游中", systemImage: "location.fill")
                Spacer()
                Label(playing ? "正在播放" : "装置已连接", systemImage: "dot.radiowaves.left.and.right")
            }
            .font(.system(size: 10))
            .foregroundStyle(.secondary)

            Spacer()

            ZStack {
                Circle().stroke(.white.opacity(0.52), lineWidth: 1).frame(width: 190, height: 190)
                Circle().stroke(.white.opacity(0.18), lineWidth: 1).frame(width: 244, height: 244)
                SoapBubble(size: 92)
                    .scaleEffect(captured ? 0.2 : 1)
                    .opacity(captured ? 0.15 : 1)
                    .offset(y: -55)
                    .animation(.spring(duration: 0.8, bounce: 0.08), value: captured)
                Text("二层回声 · 8 m")
                    .font(.system(size: 10, weight: .regular))
                    .tracking(2)
                    .foregroundStyle(.secondary)
                    .offset(y: 80)
            }

            Spacer()

            VStack(alignment: .leading, spacing: 13) {
                Text(captured ? "声音正在设备中回响" : "现场共选 · 04")
                    .font(.system(size: 10, weight: .regular))
                    .tracking(1.3)
                    .foregroundStyle(.secondary)
                Text(captured ? "风从河面来" : "「风从河面来，像一句没说完的话。」")
                    .font(.system(size: 13, weight: .regular))
                    .lineLimit(2)
                HStack {
                    if captured { WaveBars(active: playing) }
                    else { Text("林留在这里 · 12 秒").font(.system(size: 10)).foregroundStyle(.secondary) }
                    Spacer()
                    Button {
                        captured = true
                        playing = true
                    } label: {
                        Label(captured ? "已捕捉" : "捕捉", systemImage: captured ? "checkmark" : "circle.inset.filled")
                            .font(.system(size: 11, weight: .medium))
                            .padding(.horizontal, 14)
                            .padding(.vertical, 9)
                            .glassEffect(.regular, in: Capsule())
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(17)
            .frame(maxWidth: .infinity, alignment: .leading)
            .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
        }
    }
}

private struct CreateScreen: View {
    @Binding var recording: Bool
    @Binding var prompt: Int

    var body: some View {
        VStack(spacing: 18) {
            HStack {
                Label("江湾 · 01", systemImage: "location.fill")
                Spacer()
                Label("装置已连接", systemImage: "dot.radiowaves.left.and.right")
            }
            .font(.system(size: 10))
            .foregroundStyle(.secondary)

            Spacer(minLength: 12)
            Text("留一句")
                .font(.system(size: 34, weight: .light))
                .tracking(5)
            BubbleConstellation()
                .scaleEffect(0.82)
                .frame(height: 210)

            Picker("录音提示", selection: $prompt) {
                Text("给下一位").tag(0)
                Text("留在此刻").tag(1)
            }
            .pickerStyle(.segmented)

            VStack(alignment: .leading, spacing: 13) {
                Text(prompt == 0 ? "说一句，留给下一个路过的人" : "说一句，此刻的你和这里")
                    .font(.system(size: 10)).foregroundStyle(.secondary)
                Text(recording ? "正在收录这一刻…" : "一段话，刚刚好")
                    .font(.system(size: 13, weight: .regular))
                HStack {
                    Button { recording.toggle() } label: {
                        Image(systemName: recording ? "stop.fill" : "waveform")
                            .font(.system(size: 14, weight: .medium))
                            .frame(width: 38, height: 38)
                            .glassEffect(.regular, in: Circle())
                    }
                    .buttonStyle(.plain)
                    WaveBars(active: recording)
                    Spacer()
                    Text(recording ? "00:08" : "00:00").font(.system(size: 10, design: .rounded)).foregroundStyle(.secondary)
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 25, style: .continuous))

            Spacer(minLength: 18)
        }
    }
}

private struct WaveBars: View {
    var active: Bool
    private let heights: [CGFloat] = [8, 14, 20, 11, 26, 15, 9, 22, 13, 24, 10, 18]

    var body: some View {
        HStack(alignment: .center, spacing: 2) {
            ForEach(Array(heights.enumerated()), id: \.offset) { index, height in
                Capsule()
                    .fill(Color(red: 0.4, green: 0.62, blue: 0.78).opacity(0.7))
                    .frame(width: 2, height: active ? height : max(5, height * 0.45))
                    .animation(.easeInOut(duration: 0.34).delay(Double(index) * 0.025).repeatForever(autoreverses: true), value: active)
            }
        }
        .frame(height: 28)
    }
}

private struct SoundscapeTabBar: View {
    @Binding var selection: SoundscapePage

    var body: some View {
        HStack(spacing: 7) {
            ForEach(SoundscapePage.allCases, id: \.self) { item in
                Button { selection = item } label: {
                    VStack(spacing: 5) {
                        Image(systemName: item.symbol).font(.system(size: 15, weight: .regular))
                        Text(item.rawValue).font(.system(size: 9, weight: .regular))
                    }
                    .foregroundStyle(selection == item ? Color(red: 0.27, green: 0.43, blue: 0.59) : .secondary)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background {
                        if selection == item {
                            Capsule().fill(.white.opacity(0.48))
                        }
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(6)
        .glassEffect(.regular, in: Capsule())
    }
}

#Preview {
    if #available(iOS 26.0, *) {
        SoundscapeDemoView()
    }
}

