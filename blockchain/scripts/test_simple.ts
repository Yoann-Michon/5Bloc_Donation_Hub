async function main() {
    console.log("DEBUG: Script is running!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
