import SwiftUI

@available(iOS 26.0, *)
struct SoundscapeDemoView: View {
    @State private var page: SoundscapePage = .bubbles
    @State private var captured = false
    @State private var playing = false
    @State private var recording = false
    @State private var prompt = 0
    @State private var roamPhase: RoamEntryPhase = .ready

    var body: some View {
        ZStack {
            SoundscapeBackdrop()

            Group {
                switch page {
                case .bubbles:
                    BubbleHome(playing: $playing)
                case .roam:
                    RoamScreen(captured: $captured, playing: $playing, phase: $roamPhase)
                case .create:
                    CreateScreen(recording: $recording, prompt: $prompt)
                }
            }
            .padding(.horizontal, page == .bubbles ? 0 : 24)
            .padding(.top, page == .bubbles ? 0 : 12)
        }
        .safeAreaInset(edge: .bottom, spacing: 0) {
            SoundscapeTabBar(selection: $page)
                .padding(.horizontal, 30)
                .padding(.bottom, 8)
        }
        .preferredColorScheme(.light)
        .task(id: page) {
            guard page == .roam else {
                roamPhase = .ready
                return
            }
            roamPhase = .scan
            try? await Task.sleep(nanoseconds: 880_000_000)
            guard !Task.isCancelled else { return }
            roamPhase = .buffer
            try? await Task.sleep(nanoseconds: 620_000_000)
            guard !Task.isCancelled else { return }
            withAnimation(.easeOut(duration: 0.28)) { roamPhase = .ready }
        }
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

private enum PopPalette {
    static let paper = Color(red: 0.97, green: 0.96, blue: 0.92)
    static let paperLight = Color(red: 0.99, green: 0.985, blue: 0.95)
    static let ink = Color(red: 0.12, green: 0.17, blue: 0.14)
    static let forest = Color(red: 0.10, green: 0.20, blue: 0.15)
    static let moss = Color(red: 0.53, green: 0.63, blue: 0.34)
    static let lime = Color(red: 0.85, green: 0.94, blue: 0.30)
    static let coral = Color(red: 0.89, green: 0.38, blue: 0.31)
}

private struct SoundscapeBackdrop: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [PopPalette.paperLight, Color(red: 0.92, green: 0.95, blue: 0.89), Color(red: 0.89, green: 0.94, blue: 0.94)],
                startPoint: .top,
                endPoint: .bottom
            )
            RadialGradient(colors: [PopPalette.lime.opacity(0.15), .clear], center: .topTrailing, startRadius: 2, endRadius: 280)
            Circle()
                .fill(Color.white.opacity(0.55))
                .frame(width: 260, height: 260)
                .blur(radius: 58)
                .offset(x: -150, y: -290)
            Canvas { context, size in
                for index in 0..<96 {
                    let x = CGFloat((index * 37) % 101) / 101 * size.width
                    let y = CGFloat((index * 61) % 103) / 103 * size.height
                    let diameter: CGFloat = index.isMultiple(of: 8) ? 1.5 : 0.8
                    let mark = Path(ellipseIn: CGRect(x: x, y: y, width: diameter, height: diameter))
                    context.fill(mark, with: .color(PopPalette.ink.opacity(0.035)))
                }
            }
            .allowsHitTesting(false)
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
        case .all: PopPalette.lime
        case .ambience: Color(red: 0.61, green: 0.79, blue: 0.88)
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

private enum BubbleForm {
    case orb, heart, star, flower, cloud

    var shape: AnyShape {
        switch self {
        case .orb: AnyShape(Circle())
        case .heart: AnyShape(HeartBubbleShape())
        case .star: AnyShape(StarBubbleShape())
        case .flower: AnyShape(FlowerBubbleShape())
        case .cloud: AnyShape(CloudBubbleShape())
        }
    }
}

private enum RoamEntryPhase: String {
    case ready, scan, buffer
}

private struct GalleryRecord: Identifiable {
    let id: String
    let index: String
    let title: String
    let kind: RecordingKind
    let duration: String

    var form: BubbleForm {
        switch id {
        case "bell", "bicycle", "morning": .star
        case "osmanthus", "market", "smallwish", "postcard": .flower
        case "rain", "soda": .cloud
        case "wind", "steps", "goodnight", "wish": .heart
        default: .orb
        }
    }
}

private let galleryRecords = [
    GalleryRecord(id: "wind", index: "01", title: "河面上的风", kind: .ambience, duration: "12 秒"),
    GalleryRecord(id: "bell", index: "02", title: "巷口的钟声", kind: .ambience, duration: "8 秒"),
    GalleryRecord(id: "steps", index: "03", title: "刚经过的人", kind: .voice, duration: "6 秒"),
    GalleryRecord(id: "osmanthus", index: "04", title: "桂花茶的下午", kind: .thought, duration: "10 秒"),
    GalleryRecord(id: "rain", index: "05", title: "雨停以后", kind: .thought, duration: "9 秒"),
    GalleryRecord(id: "market", index: "06", title: "收摊前的灯", kind: .ambience, duration: "7 秒"),
    GalleryRecord(id: "goodnight", index: "07", title: "没说出口的晚安", kind: .voice, duration: "8 秒"),
    GalleryRecord(id: "bicycle", index: "08", title: "车铃经过", kind: .ambience, duration: "5 秒"),
    GalleryRecord(id: "wish", index: "09", title: "给明天的小愿望", kind: .voice, duration: "6 秒"),
    GalleryRecord(id: "soda", index: "10", title: "窗边的汽水", kind: .thought, duration: "7 秒"),
    GalleryRecord(id: "morning", index: "11", title: "早班车经过", kind: .ambience, duration: "11 秒"),
    GalleryRecord(id: "postcard", index: "12", title: "给陌生人的明信片", kind: .voice, duration: "9 秒"),
]

private struct SoapBubble: View {
    var size: CGFloat
    var kind: RecordingKind = .ambience
    var form: BubbleForm = .orb

    var body: some View {
        let silhouette = form.shape
        silhouette
            .fill(.ultraThinMaterial)
            .overlay {
                silhouette.fill(RadialGradient(
                    colors: [.white.opacity(0.56), kind.tint.opacity(0.26), .clear],
                    center: .init(x: 0.28, y: 0.24),
                    startRadius: 1,
                    endRadius: size * 0.72
                ))
            }
            .overlay { silhouette.stroke(AngularGradient(colors: kind.rim.map { $0.opacity(0.42) }, center: .center), lineWidth: max(0.8, size * 0.008)) }
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

private struct HeartBubbleShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.midX, y: rect.maxY * 0.88))
        path.addCurve(to: CGPoint(x: rect.width * 0.13, y: rect.height * 0.39), control1: CGPoint(x: rect.width * 0.42, y: rect.height * 0.76), control2: CGPoint(x: rect.width * 0.09, y: rect.height * 0.58))
        path.addCurve(to: CGPoint(x: rect.midX, y: rect.height * 0.29), control1: CGPoint(x: rect.width * 0.16, y: rect.height * 0.14), control2: CGPoint(x: rect.width * 0.4, y: rect.height * 0.13))
        path.addCurve(to: CGPoint(x: rect.width * 0.87, y: rect.height * 0.39), control1: CGPoint(x: rect.width * 0.6, y: rect.height * 0.13), control2: CGPoint(x: rect.width * 0.84, y: rect.height * 0.14))
        path.addCurve(to: CGPoint(x: rect.midX, y: rect.maxY * 0.88), control1: CGPoint(x: rect.width * 0.91, y: rect.height * 0.58), control2: CGPoint(x: rect.width * 0.58, y: rect.height * 0.76))
        path.closeSubpath()
        return path
    }
}

private struct StarBubbleShape: Shape {
    func path(in rect: CGRect) -> Path {
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let outer = min(rect.width, rect.height) * 0.47
        let inner = outer * 0.48
        var path = Path()
        for index in 0..<10 {
            let radius = index.isMultiple(of: 2) ? outer : inner
            let angle = Double(index) * .pi / 5 - .pi / 2
            let point = CGPoint(x: center.x + CGFloat(cos(angle)) * radius, y: center.y + CGFloat(sin(angle)) * radius)
            if index == 0 { path.move(to: point) } else { path.addLine(to: point) }
        }
        path.closeSubpath()
        return path
    }
}

private struct FlowerBubbleShape: Shape {
    func path(in rect: CGRect) -> Path {
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let scale = min(rect.width, rect.height) * 0.42
        var path = Path()
        for index in 0...120 {
            let angle = Double(index) / 120 * 2 * .pi
            let radius = scale * CGFloat(0.78 + 0.2 * cos(6 * angle))
            let point = CGPoint(x: center.x + CGFloat(cos(angle)) * radius, y: center.y + CGFloat(sin(angle)) * radius)
            if index == 0 { path.move(to: point) } else { path.addLine(to: point) }
        }
        path.closeSubpath()
        return path
    }
}

private struct CloudBubbleShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.width * 0.2, y: rect.height * 0.76))
        path.addCurve(to: CGPoint(x: rect.width * 0.28, y: rect.height * 0.39), control1: CGPoint(x: rect.width * 0.03, y: rect.height * 0.69), control2: CGPoint(x: rect.width * 0.08, y: rect.height * 0.41))
        path.addCurve(to: CGPoint(x: rect.width * 0.56, y: rect.height * 0.25), control1: CGPoint(x: rect.width * 0.32, y: rect.height * 0.23), control2: CGPoint(x: rect.width * 0.47, y: rect.height * 0.16))
        path.addCurve(to: CGPoint(x: rect.width * 0.84, y: rect.height * 0.43), control1: CGPoint(x: rect.width * 0.66, y: rect.height * 0.13), control2: CGPoint(x: rect.width * 0.83, y: rect.height * 0.24))
        path.addCurve(to: CGPoint(x: rect.width * 0.78, y: rect.height * 0.75), control1: CGPoint(x: rect.width * 0.99, y: rect.height * 0.49), control2: CGPoint(x: rect.width * 0.91, y: rect.height * 0.71))
        path.addCurve(to: CGPoint(x: rect.width * 0.2, y: rect.height * 0.76), control1: CGPoint(x: rect.width * 0.56, y: rect.height * 0.88), control2: CGPoint(x: rect.width * 0.32, y: rect.height * 0.88))
        path.closeSubpath()
        return path
    }
}

private struct BubbleHome: View {
    @Binding var playing: Bool
    @State private var filter: RecordingKind = .all
    @State private var activeRecordID = galleryRecords[0].id

    private var activeRecord: GalleryRecord {
        galleryRecords.first(where: { $0.id == activeRecordID }) ?? galleryRecords[0]
    }

    var body: some View {
        GeometryReader { proxy in
            let points: [CGPoint] = [
                .init(x: 0.5, y: 0.44), .init(x: 0.35, y: 0.19), .init(x: 0.82, y: 0.25),
                .init(x: 0.9, y: 0.5), .init(x: 0.12, y: 0.5), .init(x: 0.34, y: 0.34),
                .init(x: 0.68, y: 0.6), .init(x: 0.25, y: 0.68), .init(x: 0.92, y: 0.78),
                .init(x: 0.43, y: 0.83), .init(x: 0.07, y: 0.86), .init(x: 0.73, y: 0.91),
            ]
            let sizes: [CGFloat] = [118, 66, 88, 56, 92, 76, 58, 104, 72, 60, 84, 70]

            ZStack(alignment: .topLeading) {
                ForEach(galleryRecords.indices, id: \.self) { index in
                    let record = galleryRecords[index]
                    let isFocused = filter == .all || filter == record.kind
                    DreamBubbleOrb(
                        record: record,
                        size: sizes[index % sizes.count],
                        playing: playing && activeRecordID == record.id,
                        orbitFocused: activeRecordID == record.id,
                        focused: filter != .all && isFocused,
                        dimmed: filter != .all && !isFocused
                    ) { select(record) }
                    .position(x: proxy.size.width * points[index % points.count].x, y: proxy.size.height * points[index % points.count].y)
                }

                VStack(alignment: .leading, spacing: 0) {
                    HStack {
                        HStack(spacing: 6) {
                            Circle().fill(PopPalette.coral).frame(width: 5, height: 5)
                            Text("MY SOUND GALLERY")
                                .font(.system(size: 8, weight: .bold, design: .monospaced))
                                .tracking(0.6)
                        }
                        .foregroundStyle(PopPalette.ink.opacity(0.76))
                        .padding(.horizontal, 9)
                        .padding(.vertical, 6)
                        .glassEffect(.regular, in: Capsule())
                        Spacer()
                        Label("EchoCaster · DEMO", systemImage: "dot.radiowaves.left.and.right")
                            .font(.system(size: 8, weight: .medium))
                            .foregroundStyle(PopPalette.forest.opacity(0.64))
                    }

                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 5) {
                            Text("听见留下")
                                .font(.system(size: 29, weight: .black, design: .rounded))
                                .tracking(-1.2)
                                .foregroundStyle(PopPalette.ink)
                            Text("每一颗泡泡，都有一个人的路过。")
                                .font(.system(size: 9, weight: .medium))
                                .foregroundStyle(PopPalette.forest.opacity(0.6))
                        }
                        Spacer()
                        HStack(spacing: 4) {
                            Image(systemName: "quote.bubble")
                            Text("12 留声")
                        }
                        .font(.system(size: 8, weight: .semibold))
                        .foregroundStyle(PopPalette.forest.opacity(0.75))
                        .padding(.horizontal, 9)
                        .padding(.vertical, 7)
                        .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                    }
                    .padding(.top, 14)

                    HStack(spacing: 3) {
                        ForEach(RecordingKind.allCases) { kind in
                            Button {
                                withAnimation(.spring(response: 0.36, dampingFraction: 0.65)) { filter = kind }
                            } label: {
                                HStack(spacing: 4) {
                                    Circle().fill(kind == .all ? PopPalette.ink : kind.tint).frame(width: 5, height: 5)
                                    Text(kind.rawValue).font(.system(size: 9, weight: filter == kind ? .semibold : .regular))
                                }
                                .foregroundStyle(filter == kind ? PopPalette.ink : PopPalette.forest.opacity(0.65))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 8)
                                .background { if filter == kind { Capsule().fill(PopPalette.lime.opacity(0.82)) } }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(4)
                    .glassEffect(.regular, in: Capsule())
                    .padding(.top, 13)
                    .allowsHitTesting(true)

                    Spacer()
                    HStack {
                        Text("\(galleryRecords.count) 个回声正在呼吸")
                        Spacer()
                        Text(activeRecord.title)
                    }
                    .font(.system(size: 8, weight: .medium, design: .monospaced))
                    .foregroundStyle(PopPalette.forest.opacity(0.46))
                    .padding(.bottom, 12)
                }
                .padding(.horizontal, 19)
                .padding(.top, 10)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .allowsHitTesting(false)
            }
        }
    }

    private func select(_ record: GalleryRecord) {
        let wasActive = activeRecordID == record.id
        activeRecordID = record.id
        playing = wasActive ? !playing : true
    }
}

private struct DreamBubbleOrb: View {
    let record: GalleryRecord
    let size: CGFloat
    let playing: Bool
    let orbitFocused: Bool
    let focused: Bool
    let dimmed: Bool
    let action: () -> Void
    @State private var drifting = false
    @State private var popped = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        Button {
            withAnimation(.spring(response: 0.18, dampingFraction: 0.42)) { popped = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.26) {
                withAnimation(.spring(response: 0.5, dampingFraction: 0.38)) { popped = false }
                action()
            }
        } label: {
            VStack(spacing: 4) {
                ZStack {
                    if orbitFocused {
                        TimelineView(.animation(minimumInterval: 0.04, paused: reduceMotion)) { context in
                            let phase = context.date.timeIntervalSinceReferenceDate * 0.14
                            let tags = [record.title, record.kind.rawValue, record.duration, "SIDE A · \(record.index)"]
                            ZStack {
                                Ellipse()
                                    .stroke(.white.opacity(0.48), lineWidth: 0.8)
                                    .frame(width: size + 76, height: size + 40)
                                    .rotationEffect(.degrees(-8))
                                ForEach(tags.indices, id: \.self) { index in
                                    let angle = phase + Double(index) * (.pi * 2 / Double(tags.count)) - .pi / 2
                                    Text(tags[index])
                                        .font(.system(size: 6, weight: .semibold, design: .rounded))
                                        .lineLimit(1)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 4)
                                        .foregroundStyle(PopPalette.forest.opacity(0.78))
                                        .glassEffect(.regular, in: Capsule())
                                        .position(
                                            x: size / 2 + CGFloat(cos(angle)) * (size / 2 + 38),
                                            y: size / 2 + CGFloat(sin(angle)) * (size / 2 + 20)
                                        )
                                }
                            }
                            .frame(width: size, height: size)
                        }
                        .allowsHitTesting(false)
                    }
                    if focused {
                        Circle().stroke(style: StrokeStyle(lineWidth: 1, dash: [3, 4]))
                            .foregroundStyle(record.kind.tint.opacity(0.82))
                            .frame(width: size + 19, height: size + 19)
                            .rotationEffect(.degrees(drifting ? 8 : -8))
                    }
                    SoapBubble(size: size, kind: record.kind, form: record.form)
                        .overlay(alignment: .bottomTrailing) {
                            if playing { Image(systemName: "waveform").font(.system(size: 9, weight: .medium)).foregroundStyle(PopPalette.forest.opacity(0.68)).padding(6).glassEffect(.regular, in: Circle()).offset(x: 4, y: 4) }
                        }
                }
                Text(record.title)
                    .font(.system(size: 8, weight: .medium))
                    .foregroundStyle(PopPalette.forest.opacity(0.66))
                    .lineLimit(1)
                    .shadow(color: .white.opacity(0.8), radius: 3)
            }
            .scaleEffect(popped ? 0.72 : (drifting ? 1.025 : 0.97))
            .opacity(dimmed ? 0.16 : 1)
            .saturation(dimmed ? 0.3 : 1)
            .animation(.easeInOut(duration: 0.34), value: dimmed)
        }
        .buttonStyle(.plain)
        .onAppear { if !reduceMotion { withAnimation(.easeInOut(duration: 3.3 + Double(size.truncatingRemainder(dividingBy: 5))).repeatForever(autoreverses: true)) { drifting = true } } }
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
                            .font(.system(size: 9, weight: .bold, design: .rounded))
                            .foregroundStyle(PopPalette.ink)
                            .padding(.horizontal, 7)
                            .padding(.vertical, 4)
                            .background(PopPalette.lime.opacity(0.76), in: UnevenRoundedRectangle(topLeadingRadius: 3, bottomLeadingRadius: 7, bottomTrailingRadius: 3, topTrailingRadius: 7))
                        Text(record.title)
                            .font(.system(size: 16, weight: .bold, design: .rounded))
                            .foregroundStyle(PopPalette.ink)
                        Text("SIDE A  ·  \(record.index)  ·  \(record.duration)")
                            .font(.system(size: 8, weight: .semibold, design: .monospaced))
                            .foregroundStyle(PopPalette.forest.opacity(0.56))
                    }
                    Spacer(minLength: 0)
                    Image(systemName: playing ? "pause.fill" : "play.fill")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(Color.primary.opacity(0.6))
                }
                .padding(.horizontal, 15)
                .padding(.vertical, 13)
                .background(PopPalette.paperLight.opacity(0.92), in: RoundedRectangle(cornerRadius: 21, style: .continuous))
                .overlay { RoundedRectangle(cornerRadius: 21, style: .continuous).stroke(.white.opacity(0.98), lineWidth: 1) }
                .shadow(color: PopPalette.forest.opacity(0.09), radius: 12, y: 5)
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
    @Binding var phase: RoamEntryPhase

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(red: 0.10, green: 0.23, blue: 0.17), Color(red: 0.16, green: 0.31, blue: 0.23), Color(red: 0.10, green: 0.20, blue: 0.16)], startPoint: .topLeading, endPoint: .bottomTrailing)
            RadialGradient(colors: [PopPalette.moss.opacity(0.24), .clear], center: .topTrailing, startRadius: 2, endRadius: 260)
            ARIllustrationField()
            Circle()
                .fill(Color(red: 0.36, green: 0.48, blue: 0.26).opacity(0.34))
                .frame(width: 230, height: 230)
                .blur(radius: 52)
                .offset(x: 140, y: -150)

            VStack(spacing: 0) {
                HStack {
                    Label("江湾 · 漫游中", systemImage: "location.fill")
                    Spacer()
                    HStack(spacing: 5) {
                        Circle().fill(PopPalette.coral).frame(width: 5, height: 5)
                        Text("REC 00:12")
                            .font(.system(size: 8, weight: .bold, design: .monospaced))
                    }
                }
                .font(.system(size: 9, weight: .semibold))
                .foregroundStyle(.white.opacity(0.86))

                Spacer(minLength: 8)

                ZStack {
                    Circle().stroke(PopPalette.lime.opacity(0.48), lineWidth: 1).frame(width: 190, height: 190)
                    Circle().stroke(.white.opacity(0.18), style: StrokeStyle(lineWidth: 1, dash: [2, 6])).frame(width: 244, height: 244)
                    SoapBubble(size: 92, kind: .voice)
                        .scaleEffect(captured ? 0.2 : 1)
                        .opacity(captured ? 0.15 : 1)
                        .offset(y: -55)
                        .animation(.spring(duration: 0.8, bounce: 0.08), value: captured)
                    ViewfinderCorners().stroke(PopPalette.lime.opacity(0.84), style: StrokeStyle(lineWidth: 1.4, lineCap: .round))
                        .frame(width: 216, height: 216)
                    VStack(spacing: 5) {
                        Text("二层回声")
                            .font(.system(size: 9, weight: .bold, design: .monospaced))
                            .tracking(0.8)
                        Text("8 m  /  TARGET 01")
                            .font(.system(size: 7, weight: .medium, design: .monospaced))
                            .foregroundStyle(.white.opacity(0.72))
                    }
                    .foregroundStyle(PopPalette.lime)
                    .offset(y: 81)
                }

                Spacer(minLength: 8)

                VStack(alignment: .leading, spacing: 13) {
                    HStack {
                        Text(captured ? "声音正在设备中回响" : "现场共选 · 04")
                            .font(.system(size: 9, weight: .bold, design: .monospaced))
                            .tracking(0.7)
                        Spacer()
                        Text("SIDE A")
                            .font(.system(size: 7, weight: .bold, design: .monospaced))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 4)
                            .background(PopPalette.lime, in: Capsule())
                    }
                    .foregroundStyle(PopPalette.forest.opacity(0.72))
                    Text(captured ? "风从河面来" : "「风从河面来，像一句没说完的话。」")
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .foregroundStyle(PopPalette.ink)
                        .lineLimit(2)
                    HStack {
                        if captured { WaveBars(active: playing) }
                        else { Text("林留在这里 · 12 秒").font(.system(size: 9, weight: .medium, design: .monospaced)).foregroundStyle(PopPalette.forest.opacity(0.6)) }
                        Spacer()
                        Button {
                            captured = true
                            playing = true
                        } label: {
                            Label(captured ? "已捕捉" : "捕捉", systemImage: captured ? "checkmark" : "circle.inset.filled")
                                .font(.system(size: 10, weight: .bold, design: .rounded))
                                .foregroundStyle(PopPalette.ink)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 9)
                                .background(PopPalette.lime, in: Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(16)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(PopPalette.paperLight, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                .overlay { RoundedRectangle(cornerRadius: 20, style: .continuous).stroke(.white.opacity(0.95), lineWidth: 1) }
                .shadow(color: .black.opacity(0.18), radius: 16, y: 7)
            }
            .padding(16)
        }
        .overlay { RoundedRectangle(cornerRadius: 28, style: .continuous).stroke(.white.opacity(0.13), lineWidth: 1) }
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        .overlay {
            if phase != .ready { RoamEntryOverlay(phase: $phase) }
        }
    }
}

private struct ARIllustrationField: View {
    var body: some View {
        GeometryReader { proxy in
            ZStack {
                illustration(.flower, tint: Color(red: 0.92, green: 0.66, blue: 0.78), size: 40, rotation: -12)
                    .position(x: proxy.size.width * 0.16, y: proxy.size.height * 0.37)
                illustration(.star, tint: Color(red: 0.63, green: 0.78, blue: 0.95), size: 34, rotation: 9)
                    .position(x: proxy.size.width * 0.83, y: proxy.size.height * 0.31)
                illustration(.heart, tint: Color(red: 0.91, green: 0.64, blue: 0.76), size: 38, rotation: 13)
                    .position(x: proxy.size.width * 0.79, y: proxy.size.height * 0.58)
                illustration(.flower, tint: Color(red: 0.79, green: 0.83, blue: 0.98), size: 23, rotation: 15)
                    .position(x: proxy.size.width * 0.22, y: proxy.size.height * 0.7)
            }
        }
        .allowsHitTesting(false)
    }

    private func illustration(_ form: BubbleForm, tint: Color, size: CGFloat, rotation: Double) -> some View {
        form.shape
            .fill(tint.opacity(0.52))
            .overlay { form.shape.stroke(.white.opacity(0.86), lineWidth: 1.2) }
            .overlay(alignment: .topLeading) {
                Capsule().fill(.white.opacity(0.68)).frame(width: size * 0.25, height: 2).blur(radius: 1).rotationEffect(.degrees(-28)).offset(x: size * 0.25, y: size * 0.28)
            }
            .frame(width: size, height: size)
            .shadow(color: .black.opacity(0.24), radius: 5, y: 3)
            .rotationEffect(.degrees(rotation))
    }
}

private struct RoamEntryOverlay: View {
    @Binding var phase: RoamEntryPhase
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var travel = false
    @State private var spinning = false
    @State private var canSkip = false

    var body: some View {
        ZStack {
            Rectangle().fill(.ultraThinMaterial).overlay(Color(red: 0.08, green: 0.16, blue: 0.22).opacity(0.54))
            VStack(spacing: 18) {
                ZStack {
                    RoundedRectangle(cornerRadius: 32, style: .continuous)
                        .fill(.white.opacity(0.06))
                        .frame(width: 186, height: 186)
                        .overlay { RoundedRectangle(cornerRadius: 32, style: .continuous).stroke(.white.opacity(0.42), lineWidth: 1) }
                    ViewfinderCorners().stroke(.white.opacity(0.84), style: StrokeStyle(lineWidth: 1.3, lineCap: .round)).frame(width: 148, height: 148)
                    Circle().stroke(.white.opacity(0.28), style: StrokeStyle(lineWidth: 1, dash: [3, 5])).frame(width: 108, height: 108)
                    if phase == .scan {
                        Rectangle().fill(LinearGradient(colors: [.clear, .white.opacity(0.9), .clear], startPoint: .leading, endPoint: .trailing))
                            .frame(width: 146, height: 1)
                            .shadow(color: .white.opacity(0.7), radius: 7)
                            .offset(y: travel ? 66 : -66)
                    } else {
                        Circle().trim(from: 0.08, to: 0.76).stroke(.white.opacity(0.76), style: StrokeStyle(lineWidth: 1.4, lineCap: .round))
                            .frame(width: 80, height: 80)
                            .rotationEffect(.degrees(spinning ? 360 : 0))
                        SoapBubble(size: 29, kind: .ambience, form: .heart)
                    }
                }
                VStack(spacing: 7) {
                    Text("AR SPACE · VISUAL DEMO")
                        .font(.system(size: 7, weight: .bold, design: .monospaced))
                        .tracking(1.2)
                        .foregroundStyle(.white.opacity(0.72))
                    Text(phase == .scan ? "正在扫描周围空间" : "正在整理取景画面")
                        .font(.system(size: 17, weight: .semibold, design: .rounded))
                        .foregroundStyle(.white)
                    Text(phase == .scan ? "寻找可放置泡泡的地面与墙面" : "把声音泡泡轻轻放进这条街")
                        .font(.system(size: 9, weight: .medium))
                        .foregroundStyle(.white.opacity(0.72))
                }
                Capsule().fill(.white.opacity(0.18)).frame(width: 174, height: 2)
                    .overlay(alignment: .leading) {
                        Capsule().fill(.white.opacity(0.9)).frame(width: 56, height: 2).offset(x: travel ? 118 : 0)
                    }
                if canSkip {
                    Button { withAnimation(.easeOut(duration: 0.22)) { phase = .ready } } label: {
                        Label("立即进入取景", systemImage: "arrow.up.right")
                            .font(.system(size: 9, weight: .semibold))
                            .foregroundStyle(.white.opacity(0.9))
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(.white.opacity(0.12), in: Capsule())
                            .overlay { Capsule().stroke(.white.opacity(0.38), lineWidth: 1) }
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.42) { canSkip = true }
            guard !reduceMotion else { return }
            withAnimation(.easeInOut(duration: 1.1).repeatForever(autoreverses: true)) { travel = true }
            withAnimation(.linear(duration: 1.25).repeatForever(autoreverses: false)) { spinning = true }
        }
    }
}

private struct ViewfinderCorners: Shape {
    func path(in rect: CGRect) -> Path {
        let corner: CGFloat = 20
        var path = Path()
        path.move(to: CGPoint(x: rect.minX, y: rect.minY + corner))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.minX + corner, y: rect.minY))
        path.move(to: CGPoint(x: rect.maxX - corner, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.minY + corner))
        path.move(to: CGPoint(x: rect.minX, y: rect.maxY - corner))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.minX + corner, y: rect.maxY))
        path.move(to: CGPoint(x: rect.maxX - corner, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - corner))
        return path
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
                Label("EchoCaster · DEMO", systemImage: "dot.radiowaves.left.and.right")
            }
            .font(.system(size: 10))
            .foregroundStyle(.secondary)

            Spacer(minLength: 12)
            HStack {
                VStack(alignment: .leading, spacing: 3) {
                    Text("FIELD RECORDING / 01")
                        .font(.system(size: 8, weight: .bold, design: .monospaced))
                        .tracking(0.8)
                        .foregroundStyle(PopPalette.forest.opacity(0.62))
                    Text("留一句")
                        .font(.system(size: 32, weight: .black, design: .rounded))
                        .tracking(-1)
                        .foregroundStyle(PopPalette.ink)
                }
                Spacer()
                Text("REC")
                    .font(.system(size: 8, weight: .black, design: .monospaced))
                    .foregroundStyle(PopPalette.ink)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 6)
                    .background(PopPalette.lime, in: UnevenRoundedRectangle(topLeadingRadius: 3, bottomLeadingRadius: 8, bottomTrailingRadius: 3, topTrailingRadius: 8))
            }
            BubbleConstellation()
                .scaleEffect(0.82)
                .frame(height: 210)

            Picker("录音提示", selection: $prompt) {
                Text("给下一位").tag(0)
                Text("留在此刻").tag(1)
            }
            .pickerStyle(.segmented)
            .tint(PopPalette.moss)

            VStack(alignment: .leading, spacing: 13) {
                Text(prompt == 0 ? "说一句，留给下一个路过的人" : "说一句，此刻的你和这里")
                    .font(.system(size: 9, weight: .semibold, design: .monospaced)).foregroundStyle(PopPalette.forest.opacity(0.62))
                Text(recording ? "正在收录这一刻…" : "一段话，刚刚好")
                    .font(.system(size: 13, weight: .bold, design: .rounded)).foregroundStyle(PopPalette.ink)
                HStack {
                    Button { recording.toggle() } label: {
                        Image(systemName: recording ? "stop.fill" : "waveform")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(PopPalette.ink)
                            .frame(width: 38, height: 38)
                            .background(recording ? PopPalette.coral : PopPalette.lime, in: Circle())
                    }
                    .buttonStyle(.plain)
                    WaveBars(active: recording)
                    Spacer()
                    Text(recording ? "00:08" : "00:00").font(.system(size: 9, weight: .bold, design: .monospaced)).foregroundStyle(PopPalette.forest.opacity(0.62))
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(PopPalette.paperLight.opacity(0.89), in: RoundedRectangle(cornerRadius: 21, style: .continuous))
            .overlay { RoundedRectangle(cornerRadius: 21, style: .continuous).stroke(.white.opacity(0.95), lineWidth: 1) }
            .shadow(color: PopPalette.forest.opacity(0.08), radius: 12, y: 5)

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
                    .fill(PopPalette.moss.opacity(0.78))
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
                    .foregroundStyle(selection == item ? PopPalette.ink : PopPalette.forest.opacity(0.58))
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background {
                        if selection == item {
                            Capsule().fill(PopPalette.lime)
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
