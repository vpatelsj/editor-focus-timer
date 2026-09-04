// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "EditorFocusProbe",
    platforms: [.macOS(.v13)],
    products: [
        .executable(name: "editor-focus-probe", targets: ["EditorFocusProbe"]),
    ],
    dependencies: [
        .package(url: "https://github.com/swiftlang/swift-testing.git", from: "0.12.0"),
    ],
    targets: [
        .executableTarget(name: "EditorFocusProbe"),
        .testTarget(
            name: "EditorFocusProbeTests",
            dependencies: [
                "EditorFocusProbe",
                .product(name: "Testing", package: "swift-testing"),
            ]
        ),
    ]
)
