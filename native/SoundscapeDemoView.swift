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
                colors: [Color(red: 0.94, green: 0.98, blue: 0.97), Color(red: 0.82, green: 0.93, blue: 0.91), Color(red: 0.93, green: 0.96, blue: 0.93)],
                startPoint: .top,
                endPoint: .bottom
            )
            Ellipse()
                .fill(.white.opacity(0.42))
                .frame(height: 230)
                .blur(radius: 34)
                .offset(x: -90, y: 250)
            Ellipse()
                .fill(Color(red: 0.72, green: 0.87, blue: 0.85).opacity(0.28))
                .frame(height: 150)
                .blur(radius: 28)
                .offset(x: 100, y: 330)
        }
        .ignoresSafeArea()
    }
}

private struct SoapBubble: View {
    var size: CGFloat

    private let rim = [
        Color.white.opacity(0.95),
        Color(red: 0.38, green: 0.78, blue: 0.84).opacity(0.8),
        Color.white.opacity(0.28),
        Color(red: 0.84, green: 0.55, blue: 0.78).opacity(0.7),
        Color(red: 0.88, green: 0.75, blue: 0.45).opacity(0.72),
        Color(red: 0.44, green: 0.76, blue: 0.72).opacity(0.76),
        Color.white.opacity(0.95)
    ]

    var body: some View {
        Circle()
            .fill(.ultraThinMaterial)
            .overlay {
                Circle().fill(
                    RadialGradient(colors: [.white.opacity(0.5), .white.opacity(0.04), .clear], center: .init(x: 0.28, y: 0.24), startRadius: 1, endRadius: size * 0.72)
                )
            }
            .overlay { Circle().stroke(AngularGradient(colors: rim, center: .center), lineWidth: max(1, size * 0.014)) }
            .overlay(alignment: .topLeading) {
                Capsule()
                    .fill(.white.opacity(0.72))
                    .frame(width: size * 0.25, height: max(2, size * 0.035))
                    .blur(radius: 2)
                    .rotationEffect(.degrees(-34))
                    .offset(x: size * 0.2, y: size * 0.19)
            }
            .frame(width: size, height: size)
            .shadow(color: Color(red: 0.6, green: 0.79, blue: 0.8).opacity(0.12), radius: size * 0.12, y: size * 0.06)
    }
}

private struct BubbleHome: View {
    @Binding var playing: Bool
    let onRoam: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Label("江湾 · 01", systemImage: "location.fill")
                    .font(.system(size: 11, weight: .regular))
                    .foregroundStyle(.secondary)
                Spacer()
                Label("装置已连接", systemImage: "dot.radiowaves.left.and.right")
                    .font(.system(size: 10, weight: .regular))
                    .foregroundStyle(.secondary)
            }

            Spacer(minLength: 28)

            VStack(spacing: 8) {
                Text("今日收集 · 03")
                    .font(.system(size: 10, weight: .regular))
                    .tracking(2)
                    .foregroundStyle(.secondary)
                Text("泡泡")
                    .font(.system(size: 34, weight: .light))
                    .tracking(6)
                    .foregroundStyle(Color(red: 0.2, green: 0.36, blue: 0.37).opacity(0.72))
            }

            BubbleConstellation()
                .padding(.vertical, 16)

            Button { playing.toggle() } label: {
                HStack(spacing: 12) {
                    Image(systemName: playing ? "pause.fill" : "play.fill")
                        .font(.system(size: 12, weight: .semibold))
                        .frame(width: 38, height: 38)
                        .background(.white.opacity(0.54), in: Circle())
                    VStack(alignment: .leading, spacing: 4) {
                        Text("午后的风").font(.system(size: 13, weight: .medium))
                        Text("留在这里的一句话").font(.system(size: 10)).foregroundStyle(.secondary)
                    }
                    Spacer(minLength: 4)
                    WaveBars(active: playing)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 25, style: .continuous))
            }
            .buttonStyle(.plain)

            Button(action: onRoam) {
                Label("开始漫游", systemImage: "arrow.up.right")
                    .font(.system(size: 13, weight: .medium))
                    .tracking(1)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 15)
                    .glassEffect(.regular, in: Capsule())
            }
            .buttonStyle(.plain)
            .padding(.top, 18)

            Spacer(minLength: 20)
        }
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
                    .fill(Color(red: 0.4, green: 0.68, blue: 0.68).opacity(0.7))
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
                    .foregroundStyle(selection == item ? Color(red: 0.2, green: 0.48, blue: 0.47) : .secondary)
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
