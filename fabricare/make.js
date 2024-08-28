// Created by Grigore Stefan <g_stefan@yahoo.com>
// Public domain (Unlicense) <http://unlicense.org>
// SPDX-FileCopyrightText: 2022-2024 Grigore Stefan <g_stefan@yahoo.com>
// SPDX-License-Identifier: Unlicense

Fabricare.include("vendor");

messageAction("make");

if (Shell.fileExists("temp/build.done.flag")) {
	return;
};

if (!Shell.directoryExists("source")) {
	exitIf(Shell.system("7z x -aoa archive/" + Project.vendor + ".7z"));
	Shell.rename(Project.vendor, "source");
};

Shell.mkdirRecursivelyIfNotExists("output");
Shell.mkdirRecursivelyIfNotExists("output/bin");
Shell.mkdirRecursivelyIfNotExists("output/include");
Shell.mkdirRecursivelyIfNotExists("output/lib");
Shell.mkdirRecursivelyIfNotExists("temp");

Shell.mkdirRecursivelyIfNotExists("temp/cmake");

if (!Shell.fileExists("temp/build.config.flag")) {
	Shell.setenv("CC","cl.exe");
	Shell.setenv("CXX","cl.exe");

	if (Fabricare.isStatic()) {
		Shell.copyFile("fabricare/source/CMakeLists.txt", "source/CMakeLists.txt");
		Shell.copyFile("fabricare/source/training/CMakeLists.txt", "source/src/training/CMakeLists.txt");
		Shell.copyFile("fabricare/source/training/text2image.cpp", "source/src/training/text2image.cpp");
	};

	cmdConfig="cmake";
	cmdConfig+=" ../../source";
	cmdConfig+=" -G \"Ninja\"";
	cmdConfig+=" -DCMAKE_BUILD_TYPE=Release";
	cmdConfig+=" -DCMAKE_INSTALL_PREFIX="+Shell.realPath(Shell.getcwd())+"\\output";

	if (Fabricare.isDynamic()) {
		cmdConfig += " -DBUILD_SHARED_LIBS=ON";
		cmdConfig += " -DSW_BUILD_SHARED_LIBS=1";
		cmdConfig += " -DWIN32_MT_BUILD=OFF";
		cmdConfig += " -DBUILD_TRAINING_TOOLS=OFF";
	};

	if (Fabricare.isStatic()) {
		cmdConfig += " -DBUILD_SHARED_LIBS=OFF";
		cmdConfig += " -DSW_BUILD_SHARED_LIBS=0";
		cmdConfig += " -DWIN32_MT_BUILD=ON";
	};


	runInPath("temp/cmake",function(){
		exitIf(Shell.system(cmdConfig));
	});

	Shell.filePutContents("temp/build.config.flag", "done");
};

runInPath("temp/cmake",function(){
	exitIf(Shell.system("ninja"));
	exitIf(Shell.system("ninja install"));
	exitIf(Shell.system("ninja clean"));
});

Shell.copyFile("output/lib/tesseract54.lib","output/lib/tesseract.lib");

Shell.filePutContents("temp/build.done.flag", "done");

