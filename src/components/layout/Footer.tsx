export function Footer() {
    return (
        <footer className="border-t bg-card py-6 mt-auto">
            <div className="container px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 md:h-12 md:flex-row">
                <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} ContextSwitch Insight. All
                    rights reserved.
                </p>
                <p className="text-sm font-medium text-primary italic">
                    Built for Trae Hackathon
                </p>
            </div>
        </footer>
    );
}
